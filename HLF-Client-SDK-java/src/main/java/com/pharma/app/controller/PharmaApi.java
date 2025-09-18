package com.pharma.app.controller;

import com.pharma.app.model.*;
import com.pharma.app.exception.PharmaAppException;
import com.pharma.app.service.HLFServices;
import com.pharma.app.model.EventSubscriberRequest;
import com.pharma.app.model.HLFPostRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/pharma-app/v1.0")
@Slf4j
public class PharmaApi {

    @Autowired
    HLFServices hLFServices;

    /**
     * Test the connection to the server
     * @return
     */
    @GetMapping(value = "/")
    public ResponseEntity<Void> testConnection() {
        log.debug("connection is successful!");
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * to submit transactions to the HLF Network
     * @param transactionRequest
     * @return
     */
    @PostMapping(value = "/HLF/submitTransactions", produces = "application/json; charset=utf-8")
    public  String hlfCreateTransactions(@RequestBody HLFPostRequest transactionRequest) {
        try {
           return hLFServices.submitTransactions(transactionRequest);
        } catch (Exception e) {
            throw new PharmaAppException("createTransactions exception:" + e);
        }
    }

    /**
     * to submit transport transactions to the HLF Network
     * @param transactionRequest
     * @return
     */
    @PostMapping(value = "/HLF/submitTransportTransactions", produces = "application/json; charset=utf-8")
    public  String submitTransportTransactions(@RequestBody HLFPostRequest transactionRequest) {
        try {
            return hLFServices.recordTransportWithAI(transactionRequest);
        } catch (Exception e) {
            throw new PharmaAppException("createTransactions exception:" + e);
        }
    }

    /**
     * To query the data from HLF Network
     * @param channelName
     * @param chaincodeName
     * @param methodName
     * @param value
     * @return
     */
    @GetMapping(value = "/HLF/getTransactions", produces = "application/json; charset=utf-8")
    public String hlfReadTransactions(@RequestParam(name = "channelName", required = true) String channelName,
                                      @RequestParam(name = "chaincodeName", required = true) String chaincodeName,
                                      @RequestParam(name = "methodName", required = true) String methodName,
                                      @RequestParam(name = "value", required = true) String... value) {
        try {
           return hLFServices.getTransactions(channelName,chaincodeName,methodName,value);
        } catch (Exception e) {
            throw new PharmaAppException("readTransactions exception:" + e);
        }
    }

    /**
     * To subscribe to the chaincode events in the network
     * @param eventSubscriberRequest
     * @return
     */
    @PostMapping(value = "/HLF/subscribeEvent", produces = "application/json; charset=utf-8")
    public  String hlfCreateSubscription(@RequestBody EventSubscriberRequest eventSubscriberRequest) {
        try {
            return hLFServices.subscribeEvents(eventSubscriberRequest);
        } catch (Exception e) {
            throw new PharmaAppException("hlf subscribeEvent exception:" + e);
        }
    }

    /**
     * To get the list of subscribers
     * @return
     */
    @GetMapping(value = "/HLF/getSubscribeList", produces = "application/json; charset=utf-8")
    public  String hlfGetSubscribeList() {
        try {
            return hLFServices.getEventSubscribeList();
        } catch (Exception e) {
            throw new PharmaAppException("hlf getSubscribeList exception:" + e);
        }
    }

    /**
     * To get the block height of the HLF Network
     * @param channelName
     * @return
     */
    @GetMapping(value = "/HLF/getBlockHeight", produces = "application/json; charset=utf-8")
    public String hlfBlockHeight(@RequestParam(name = "channelName", required = true) String channelName) {
        try {
            return hLFServices.getBlockHeight(channelName);
        } catch (Exception e) {
            throw new PharmaAppException("hlf BlockHeight exception:" + e);
        }
    }
    
}
