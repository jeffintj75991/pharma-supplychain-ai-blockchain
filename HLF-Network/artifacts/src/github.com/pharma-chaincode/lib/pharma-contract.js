
'use strict';

const { Contract } = require('fabric-contract-api');

const COLLECTIONS = {
  TRANSPORT: 'transportPrivateData',
  AUDIT: 'auditPrivateData',
  BATCH: 'batchPrivateData'
};

const ORG = {
  MANUFACTURER: 'ManufacturerMSP',
  DISTRIBUTOR: 'DistributorMSP',
  REGULATOR: 'RegulatorMSP'
};

function assert(cond, msg) { if (!cond) throw new Error(msg); }

function deterministicStringify(obj) {
  if (obj === null || obj === undefined) return JSON.stringify(obj);
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return JSON.stringify(obj);
  }
  const allKeys = Object.keys(obj).sort();
  const ordered = {};
  for (const k of allKeys) {
    ordered[k] = obj[k];
  }
  return JSON.stringify(ordered);
}

class PharmaContract extends Contract {
  constructor() {
    super('pharma');
  }

  // ---------------- Utilities ----------------
  async _assetExists(ctx, id) {
    const data = await ctx.stub.getState(id);
    return !!(data && data.length);
  }

  _clientMSP(ctx) {
    return ctx.clientIdentity.getMSPID();
  }

  _requireAny(ctx, allowedMsps = []) {
    const msp = this._clientMSP(ctx);
    assert(allowedMsps.includes(msp), `Access denied for MSP ${msp}`);
  }

  _getTxTimeISO(ctx) {
    const txTime = ctx.stub.getTxTimestamp();
    let seconds = 0;
    if (txTime && txTime.seconds) {
      if (typeof txTime.seconds === 'object' && txTime.seconds.low !== undefined) {
        seconds = txTime.seconds.low;
      } else {
        seconds = Number(txTime.seconds);
      }
    }
    const nanos = txTime && txTime.nanos ? Number(txTime.nanos) : 0;
    const millis = seconds * 1000 + Math.floor(nanos / 1e6);
    return new Date(millis).toISOString();
  }

  // Deterministic putState wrapper
  async _putStateDeterministic(ctx, key, obj) {
    const s = deterministicStringify(obj);
    await ctx.stub.putState(key, Buffer.from(s));
  }

  // Deterministic putPrivateData wrapper
  async _putPrivateDataDeterministic(ctx, collection, key, obj) {
    const s = deterministicStringify(obj);
    await ctx.stub.putPrivateData(collection, key, Buffer.from(s));
  }

  // Composite key helper for private data
  _createPDKey(ctx, objectType, attributes) {
    return ctx.stub.createCompositeKey(objectType, attributes);
  }

  // Robust iterator collector (handles different runtimes)
  async _collectIterator(iterator) {
    const all = [];
    if (!iterator) return all;

    try {
      if (typeof iterator.next === 'function') {
        while (true) {
          const res = await iterator.next();
          if (res && res.value) {
            const val = res.value.value ? res.value.value.toString('utf8') : res.value.toString('utf8');
            try { all.push(JSON.parse(val)); } catch { all.push(val); }
          }
          if (res.done) break;
        }
      } else if (Array.isArray(iterator)) {
        for (const item of iterator) {
          if (!item) continue;
          const v = item.value ? item.value.toString('utf8') : item.toString('utf8');
          try { all.push(JSON.parse(v)); } catch { all.push(v); }
        }
      } else {
        try { all.push(JSON.parse(JSON.stringify(iterator))); } catch { /* ignore */ }
      }
    } finally {
      try { if (typeof iterator.close === 'function') await iterator.close(); } catch (e) { /* ignore */ }
    }
    return all;
  }


  async CreateBatch(ctx, batchId, drugName, mfgDate, expDate) {
    assert(batchId, 'batchId required');
    assert(!(await this._assetExists(ctx, batchId)), `Batch ${batchId} already exists`);

    this._requireAny(ctx, [ORG.MANUFACTURER]);

    const batch = {
      docType: 'batch',
      batchId: batchId,
      drugName: drugName || '',
      mfgDate: mfgDate || '',
      expDate: expDate || '',
      status: 'CREATED',
      createdBy: this._clientMSP(ctx),
      createdAt: this._getTxTimeISO(ctx)
    };

    await this._putStateDeterministic(ctx, batchId, batch);
    return batch;
  }

  async AddSimulationResult(ctx, batchId) {
    this._requireAny(ctx, [ORG.MANUFACTURER]);
    assert(await this._assetExists(ctx, batchId), `Batch ${batchId} not found`);

    const transient = ctx.stub.getTransient();
    assert(transient && transient.has('simulation'), 'transient.simulation required');

    let simulation;
    try { simulation = JSON.parse(transient.get('simulation').toString()); }
    catch (e) { throw new Error('transient.simulation must be valid JSON'); }

    const snapshot = {
      modelVersion: simulation.modelVersion || null,
      curvePointsCount: Array.isArray(simulation.curve) ? simulation.curve.length : 0,
      notes: simulation.notes || null
    };

    const raw = await ctx.stub.getState(batchId);
    const batch = JSON.parse(raw.toString());
    batch.simulationSnapshot = snapshot;
    batch.simulationRecordedAt = this._getTxTimeISO(ctx);

    await this._putStateDeterministic(ctx, batchId, batch);
    return { ok: true };
  }


  async RecordTransport(ctx, batchId) {
    this._requireAny(ctx, [ORG.MANUFACTURER, ORG.DISTRIBUTOR]);
    assert(await this._assetExists(ctx, batchId), `Batch ${batchId} not found`);

    const tmap = ctx.stub.getTransient();
    assert(tmap && tmap.has('transport'), 'transient.transport required');
    let obj;
    try { obj = JSON.parse(tmap.get('transport').toString()); } catch (e) { throw new Error('transient.transport must be valid JSON'); }

    const observedTs = (obj.timestamp && typeof obj.timestamp === 'string') ? obj.timestamp : null;
    const recordedAt = observedTs || this._getTxTimeISO(ctx);

    const pdKey = this._createPDKey(ctx, 'transport', [batchId, recordedAt]);

    const payload = {
      batchId,
      observed: obj,
      recordedBy: this._clientMSP(ctx),
      recordedAt
    };

    await this._putPrivateDataDeterministic(ctx, COLLECTIONS.TRANSPORT, pdKey, payload);
    return { key: pdKey, recordedAt };
  }

  async AddPredictionResult(ctx, batchId) {
    console.log(`AddPredictionResult invoked for batchId=${batchId}`);

    this._requireAny(ctx, [ORG.MANUFACTURER, ORG.DISTRIBUTOR]);
    console.log("Authorization check passed");

    const exists = await this._assetExists(ctx, batchId);
    console.log(`Asset existence check for ${batchId}: ${exists}`);
    assert(exists, `Batch ${batchId} not found`);

    const tmap = ctx.stub.getTransient();
    console.log("Transient map received:", tmap ? Array.from(tmap.keys()) : []);
    assert(tmap && tmap.has('prediction'), 'transient.prediction required');

    let obj;
    try {
        obj = JSON.parse(tmap.get('prediction').toString());
        console.log("Parsed prediction transient value:", obj);
    } catch (e) {
        console.error("Failed to parse transient.prediction", e);
        throw new Error('transient.prediction must be valid JSON');
    }

    const observedTs = (obj.timestamp && typeof obj.timestamp === 'string') ? obj.timestamp : null;
    const recordedAt = observedTs || this._getTxTimeISO(ctx);
    console.log(`Prediction timestamp observedTs=${observedTs}, recordedAt=${recordedAt}`);

    const pdKey = this._createPDKey(ctx, 'prediction', [batchId, recordedAt]);
    console.log(`Generated private data key: ${pdKey}`);

    const payload = {
        batchId,
        prediction: obj,  
        recordedBy: this._clientMSP(ctx),
        recordedAt
    };
    console.log("Payload to store in private data:", payload);

    await this._putPrivateDataDeterministic(ctx, COLLECTIONS.TRANSPORT, pdKey, payload);
    console.log("Stored prediction payload in private data collection");

    const raw = await ctx.stub.getState(batchId);
    const batch = JSON.parse(raw.toString());
    batch.prediction = obj;
    console.log("Updated batch with prediction:", batch.prediction);

    await this._putStateDeterministic(ctx, batchId, batch);
    console.log(`Batch ${batchId} state updated with prediction`);

    console.log(`AddPredictionResult completed successfully for batchId=${batchId}`);
    return { key: pdKey, recordedAt };
}


  async AuditBatch(ctx, batchId) {
    this._requireAny(ctx, [ORG.MANUFACTURER, ORG.REGULATOR]);
    assert(await this._assetExists(ctx, batchId), `Batch ${batchId} not found`);

    const tmap = ctx.stub.getTransient();
    assert(tmap && tmap.has('audit'), 'transient.audit required');
    let audit;
    try { audit = JSON.parse(tmap.get('audit').toString()); } catch (e) { throw new Error('transient.audit must be valid JSON'); }

    const recordedAt = this._getTxTimeISO(ctx);
    const pdKey = this._createPDKey(ctx, 'audit', [batchId, recordedAt]);

    const payload = {
      batchId,
      audit,
      recordedBy: this._clientMSP(ctx),
      recordedAt
    };

    await this._putPrivateDataDeterministic(ctx, COLLECTIONS.AUDIT, pdKey, payload);

    const raw = await ctx.stub.getState(batchId);
    const batch = JSON.parse(raw.toString());

    batch.lastAuditedAt = recordedAt;
    if (audit.status) batch.status = audit.status;

    await this._putStateDeterministic(ctx, batchId, batch);

    return { key: pdKey, recordedAt };
  }

  // ---------------- Queries ----------------

  async GetBatch(ctx, batchId) {
    assert(await this._assetExists(ctx, batchId), `Batch ${batchId} not found`);
    const raw = await ctx.stub.getState(batchId);
    const obj = JSON.parse(raw.toString());
    return JSON.parse(deterministicStringify(obj)); 
  }

  async GetBatchDetails(ctx, batchId) {
    const batch = await this.GetBatch(ctx, batchId);
    const caller = this._clientMSP(ctx);

    const result = { batch };

    if ([ORG.MANUFACTURER, ORG.DISTRIBUTOR].includes(caller)) {
      try {
        const iterT = await ctx.stub.getPrivateDataByPartialCompositeKey(COLLECTIONS.TRANSPORT, 'transport', [batchId]);
        result.transport = await this._collectIterator(iterT);
      } catch (e) {
        result.transport = { error: `private read failed: ${e.message || e.toString()}` };
      }
      try {
        const iterP = await ctx.stub.getPrivateDataByPartialCompositeKey(COLLECTIONS.TRANSPORT, 'prediction', [batchId]);
        result.predictions = await this._collectIterator(iterP);
      } catch (e) {
        result.predictions = { error: `private read failed: ${e.message || e.toString()}` };
      }
    } else {
      result.transport = { note: 'private to Manufacturer+Distributor' };
      result.predictions = { note: 'private to Manufacturer+Distributor' };
    }

    if ([ORG.MANUFACTURER, ORG.REGULATOR].includes(caller)) {
      try {
        const iterA = await ctx.stub.getPrivateDataByPartialCompositeKey(COLLECTIONS.AUDIT, 'audit', [batchId]);
        result.audits = await this._collectIterator(iterA);
      } catch (e) {
        result.audits = { error: `private read failed: ${e.message || e.toString()}` };
      }
    } else {
      result.audits = { note: 'private to Manufacturer+Regulator' };
    }

    return JSON.parse(deterministicStringify(result)); // normalize output
  }

  async ListAllBatches(ctx) {
    const query = { selector: { docType: 'batch' } };
    const iter = await ctx.stub.getQueryResult(JSON.stringify(query));
    const arr = await this._collectIterator(iter);

    const normalized = arr.map(item => {
      try { return JSON.parse(deterministicStringify(item)); } catch { return item; }
    });

    return normalized;
  }

  

}

module.exports = PharmaContract;
