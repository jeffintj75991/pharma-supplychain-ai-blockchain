package com.pharma.app.model;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
//@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"value"})
//@JsonPropertyOrder({"chaincodeName", "methodName","isTransient","transientKey","transientValue", "inputParameters","channelName"})
public class HLFPostRequest {

//    public TransactionRequest(String chaincodeName,String methodName,String[] inputParameters,String channelName){
//        this.chaincodeName=chaincodeName;
//        this.methodName=methodName;
//        this.inputParameters=inputParameters;
//        this.channelName=channelName;
//    }

    @JsonProperty("chaincodeName")
    private String chaincodeName;


    @JsonProperty("methodName")
    private String methodName;


    @JsonProperty("isTransient")
    private boolean isTransient;


    @JsonProperty("transientKey")
    private String transientKey;


    @JsonProperty("transientValue")
    private String transientValue;

    @JsonProperty("inputParameters")
    private String[] inputParameters;

    @JsonProperty("channelName")
    private String channelName;

}
