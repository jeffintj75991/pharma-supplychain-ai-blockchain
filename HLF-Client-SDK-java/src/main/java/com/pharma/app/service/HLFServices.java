package com.pharma.app.service;

import com.pharma.app.config.HLFConnection;
import com.pharma.app.exception.PharmaAppException;
import com.pharma.app.model.EventSubscriberRequest;
import com.pharma.app.model.HLFPostRequest;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;
import lombok.extern.slf4j.Slf4j;
import org.hyperledger.fabric.client.CommitException;
import org.hyperledger.fabric.client.Contract;
import org.hyperledger.fabric.client.Network;
import org.hyperledger.fabric.client.Proposal;
import org.hyperledger.fabric.protos.common.BlockchainInfo;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;


@Service
@Slf4j
public class HLFServices {

    @Value("${hlf.retry}")
    private int maxRetries;

    @Autowired
    HLFConnection hLFConnection;

    @Autowired
    DBServices dBServices;

    @Autowired
    ExternalServices externalServices;

    private Contract contract;

    private Map<String, EventSubscriberRequest> subscriptionRequestMap = new ConcurrentHashMap<>();
    JSONObject finalPrediction;
    String predictionResult;

    private final ExecutorService singleTreadExecutor = Executors.newSingleThreadExecutor();
    private Map<String, String> subscribeObjectMap = new ConcurrentHashMap<>();
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private final ExecutorService executor = Executors.newCachedThreadPool();


    public String submitTransactions(HLFPostRequest hLFPostRequest) {

        int attempt = 0;
        while (attempt < maxRetries) {
            attempt++;
            try {

                log.debug("submitTransactions:start");
                byte[] ccResponse = null;

                log.debug("hLFPostRequest-" + hLFPostRequest);


                log.debug("channel name:" + hLFPostRequest.getChannelName());
                Network netObj = hLFConnection.connectionCreation(hLFPostRequest.getChannelName());
                contract = netObj.getContract(hLFPostRequest.getChaincodeName());
                Date startTime = new Date();
                //for private transactions
                if (hLFPostRequest.isTransient()) {
                    byte[] payloadData = hLFPostRequest.getTransientValue().getBytes(StandardCharsets.UTF_8);
                    Map<String, byte[]> payloadTransient = new HashMap<>();
                    payloadTransient.put(hLFPostRequest.getTransientKey(), payloadData);
                    log.debug("calling submit transaction");
                    // Submit transactions that store state to the ledger.

                    Proposal proposal = contract.newProposal(hLFPostRequest.getMethodName())
                            .putTransient(hLFPostRequest.getTransientKey(), payloadData)
                            .addArguments(hLFPostRequest.getInputParameters())
                            .build();
                    ccResponse = proposal.endorse().submit();
                } else {
                    log.debug("calling submit transaction");
                    // Submit transactions that store state to the ledger.
                    ccResponse = contract.submitTransaction(hLFPostRequest.getMethodName(),
                            hLFPostRequest.getInputParameters());
                }
                Date endTime = new Date();
                long diffInTime = endTime.getTime() - startTime.getTime();
                log.debug("POST:Time difference (ms):" + diffInTime);
                log.debug("response:" + new String(ccResponse, StandardCharsets.UTF_8));
                JSONObject result = new JSONObject();
                result.put("Chaincode-response", new String(ccResponse, StandardCharsets.UTF_8));
                return result.toString();
            } catch (CommitException e) {

                    log.debug("CommitException- Retrying attempt:", attempt);
                    try {
                        TimeUnit.MILLISECONDS.sleep(200L * attempt); // small backoff
                    } catch (InterruptedException ignored) {
                        throw new PharmaAppException("HLF submitTransactions exception:" + ignored);
                    }
            } catch (Exception e) {
                log.debug("HLF submitTransactions exception:" + e);
                throw new PharmaAppException("HLF submitTransactions exception:" + e);
            }
        }
        throw new PharmaAppException("HLF submitTransactions failed after " + maxRetries + " retries due to MVCC conflicts");
    }

    public String getTransactions(String channelName, String chaincodeName, String methodName, String... value) {
        try {
            log.debug("getTransactions:start");
            log.debug("channelName:" + channelName);
            log.debug("chaincodeName:" + chaincodeName);
            log.debug("methodName:" + methodName);
            log.debug("input parameters:" + Arrays.toString(value));
            Date startTime = new Date();

            byte[] queryMsg = null;
            Network netObj = hLFConnection.connectionCreation(channelName);
            contract = netObj.getContract(chaincodeName);
            queryMsg = contract.evaluateTransaction(methodName, value);
            log.debug("query response:" + new String(queryMsg, StandardCharsets.UTF_8));
            //JSONObject result = new JSONObject(new String(queryMsg, StandardCharsets.UTF_8));
            Date endTime = new Date();
            long diffInTime = endTime.getTime() - startTime.getTime();
            log.debug("GET:Time difference (ms):" + diffInTime);
            log.debug("getTransactions:end");
            //return result.toString();
            return new String(queryMsg, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.debug("HLF getTransactions exception:" + e);
            throw new PharmaAppException("HLF getTransactions exception:" + e);
        }
    }


    public String recordTransportWithAI(HLFPostRequest transportRequest) {
        try {
            String response = submitTransactions(transportRequest);
            String batchId = transportRequest.getInputParameters()[0];

            String transientJsonString = transportRequest.getTransientValue();
            JSONObject transientJson = new JSONObject(transientJsonString);
            double temperature = transientJson.getDouble("temperature");
            double humidity = transientJson.getDouble("humidity");
            // Step 2: Run AI + Simulation in parallel
            CompletableFuture<Void> predictionFuture = CompletableFuture.runAsync(() -> {
                try {
                    String prediction = externalServices.runAIModel(temperature, humidity);
                    log.debug("prediction:" + prediction);
                    finalPrediction=new JSONObject(prediction);
                     predictionResult=finalPrediction.getString("risk");
                    auditReport(batchId,predictionResult,transportRequest.getChannelName());
                    HLFPostRequest predictionRequest = new HLFPostRequest();
                    predictionRequest.setChaincodeName("pharma-cc");
                    predictionRequest.setMethodName("AddPredictionResult");
                    predictionRequest.setChannelName(transportRequest.getChannelName());
                    predictionRequest.setTransient(true);
                    predictionRequest.setTransientKey("prediction");
                    predictionRequest.setTransientValue(prediction);
                    predictionRequest.setInputParameters(new String[]{batchId});


                    submitTransactions(predictionRequest);
                    log.info(" Prediction result recorded for batch {}", batchId);
                } catch (Exception e) {
                    log.error("Prediction submission failed for batch {}", batchId, e);
                }
            }, executor);

            CompletableFuture<Void> simulationFuture = CompletableFuture.runAsync(() -> {
                try {
                    String simulationCurve = externalServices.runSimulationCurve();
                    JSONObject simulationCurveJson= new JSONObject(simulationCurve);
                    simulationCurveJson.put("modelVersion","v1.0");
                    simulationCurveJson.put("notes","Hardcoded simulation data");

                    log.debug("simulationCurve:" + simulationCurveJson);
                    HLFPostRequest simulationRequest = new HLFPostRequest();
                    simulationRequest.setChaincodeName("pharma-cc");
                    simulationRequest.setMethodName("AddSimulationResult");
                    simulationRequest.setChannelName(transportRequest.getChannelName());
                    simulationRequest.setTransient(true);
                    simulationRequest.setTransientKey("simulation");
                    simulationRequest.setTransientValue(simulationCurveJson.toString());
                    simulationRequest.setInputParameters(new String[]{batchId});

                    submitTransactions(simulationRequest);
                    log.info(" Simulation result recorded for batch {}", batchId);
                } catch (Exception e) {
                    log.error("Simulation submission failed for batch {}", batchId, e);
                }
            }, executor);
            return response;
        } catch (Exception e) {
            log.debug("HLF recordTransportWithAI exception:" + e);
            throw new PharmaAppException("HLF recordTransportWithAI exception:" + e);
        }

    }

    public String auditReport(String batchId,String predictionResult,String channelName){
        JSONObject transientValue= new JSONObject();
        HLFPostRequest auditReportRequest= new HLFPostRequest();
        Instant currentTimestamp = Instant.now();
        if(predictionResult.equalsIgnoreCase("No")){
            transientValue.put("status","APPROVED");
            transientValue.put("remarks","All good");

        }else{
            transientValue.put("status","NOT APPROVED");
            transientValue.put("remarks","Goods are spoiled");
        }
        transientValue.put("timestamp",currentTimestamp);

        auditReportRequest.setChaincodeName("pharma-cc");
        auditReportRequest.setMethodName("AuditBatch");
        auditReportRequest.setChannelName(channelName);
        auditReportRequest.setTransient(true);
        auditReportRequest.setTransientKey("audit");
        auditReportRequest.setInputParameters(new String[]{batchId});

        auditReportRequest.setTransientValue(transientValue.toString());

        String response=submitTransactions(auditReportRequest);
        log.info(" Audit Report is recorded for batch {}", batchId);
        return response;
    }


    public String subscribeEvents(EventSubscriberRequest eventSubscribeRequest) {
        log.debug("EventSubscribeRequest: {}", eventSubscribeRequest);
        try {
            String subscriptionId = this.subscriptionIdGenerator();
            log.debug("EventType:CONTRACT");
            CompletableFuture.runAsync(() -> {
                subscribeContractEvents(eventSubscribeRequest);
            });
            JSONObject result = new JSONObject();
            result.put("subscriptionId", subscriptionId);
            String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new java.util.Date());

            subscribeObjectMap.put("ChaincodeSubscriptions-" +
                    "startBlock-:" + eventSubscribeRequest.getStartBlockNumber() +
                    ",EndBlock-:" + eventSubscribeRequest.getEndBlockNumber() + ",Time:" + timeStamp, subscriptionId);
            return result.toString();
        } catch (Exception e) {
            log.debug("subscribeEvents exception:" + e);
            throw new PharmaAppException("subscribeEvents exception:" + e);
        }

    }

    private void subscribeContractEvents(EventSubscriberRequest eventSubscribeRequest) {
        try {
            Network netObj = hLFConnection.connectionCreation(eventSubscribeRequest.getChannelName());
            replayChaincodeEvents(netObj, eventSubscribeRequest.getChaincode(),
                    eventSubscribeRequest.getStartBlockNumber(), eventSubscribeRequest.getEndBlockNumber());
        } catch (Exception e) {
            log.debug("subscribeContractEvents exception:" + e);
            throw new PharmaAppException("subscribeContractEvents exception:" + e);
        }

    }

    private void replayChaincodeEvents(Network netObj, String chaincodeName, final long startBlock, final long endBlock) {
        log.debug("\n*** Start chaincode event replay");
        try {
            var request = netObj.newChaincodeEventsRequest(chaincodeName)
                    .startBlock(startBlock)
                    .build();

            try (var eventIter = request.getEvents()) {
                while (eventIter.hasNext()) {
                    var event = eventIter.next();
                    var payload = prettyJson(event.getPayload());
                    log.debug("\n<-- Chaincode event replayed: " + "Block number:" + event.getBlockNumber() + "-" + event.getEventName() + " - " + payload);
                    if (event.getBlockNumber() == endBlock) {
                        // Reached the end block-Listener stops
                        break;
                    }
                    // Insert data into the event_details table eventTable
                    dBServices.insertEventData(chaincodeName, "CONTRACT", event.getEventName(), payload, new Date());

                }
            }
        } catch (Exception e) {
            log.debug("replayChaincodeEvents exception:" + e);
            throw new PharmaAppException("replayChaincodeEvents exception:" + e);
        }
    }


    private String prettyJson(final byte[] json) {
        return prettyJson(new String(json, StandardCharsets.UTF_8));
    }

    private String prettyJson(final String json) {
        var parsedJson = JsonParser.parseString(json);
        return gson.toJson(parsedJson);
    }

    public String getEventSubscribeList() {
        log.debug("FabricEventListener:subscribeObjectMap :" + subscribeObjectMap.toString());
        JSONObject result = new JSONObject();
        result.put("SubscriptionList", subscribeObjectMap.keySet().toString());
        return result.toString();
        //return subscribeObjectMap.keySet().toString();

    }

    private String subscriptionIdGenerator() {
        String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new java.util.Date());
        int randomNumber = new SecureRandom().nextInt(1000);
        return timeStamp + randomNumber;
    }

    public String getBlockHeight(String channelName) {
        try {
            log.debug("getTransactions:start");
            log.debug("channelName:" + channelName);
            Network netObj = hLFConnection.connectionCreation(channelName);
            contract = netObj.getContract("qscc");
            byte[] resultTran = contract.evaluateTransaction("GetChainInfo", channelName);
            BlockchainInfo info = BlockchainInfo.parseFrom(resultTran);
            long blockHeight = info.getHeight();
            log.debug("blockHeight :" + blockHeight);
            JSONObject result = new JSONObject();
            result.put("blockHeight", blockHeight);
            return result.toString();
        } catch (Exception e) {
            log.debug("HLF getBlockHeight exception:" + e);
            throw new PharmaAppException("HLF getBlockHeight exception:" + e);
        }
    }

}

