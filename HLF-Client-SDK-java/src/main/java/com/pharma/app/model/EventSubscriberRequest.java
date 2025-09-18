package com.pharma.app.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@JsonPropertyOrder({"value"})
@NoArgsConstructor
@AllArgsConstructor
public class EventSubscriberRequest {
    @JsonProperty("channelName")
    private String channelName;

    @JsonProperty("chaincode")
    private String chaincode;

    @JsonProperty("eventNameList")
    private List<String> eventNameList;

    @JsonProperty("startBlockNumber")
    private int startBlockNumber;

    @JsonProperty("endBlockNumber")
    private int endBlockNumber;
}
