package com.pharma.app.service;

import com.pharma.app.exception.PharmaAppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class ExternalServices {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ai.prediction.url}")
    private String aiUrl;

    @Value("${simulation.curve.url}")
    private String simulationUrl;

    public String runAIModel(double temperature, double humidity) {
        try {
            String url = aiUrl;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("temp", temperature);
            requestBody.put("humidity", humidity);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            } else {
                log.error("AI service returned status {}", response.getStatusCode());
                return "ERROR";
            }
        } catch (Exception e) {
            log.error("AI prediction call failed", e);
            throw new PharmaAppException("runAIModel exception:" + e);
        }
    }

    public String runSimulationCurve() {
        try {
            String url = simulationUrl;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("C0", 100.0);
            requestBody.put("A", 1.0e12);
            requestBody.put("Ea", 85000.0);
            requestBody.put("time_start", 0.0);
            requestBody.put("time_end", 70.0);
            requestBody.put("time_points", 8);
            requestBody.put("temperature_profile", Arrays.asList(25,30,28,35,33,40,38,36));
            requestBody.put("humidity_profile", Arrays.asList(60,65,70,75,70,65,60,55));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody(); // expected JSON curve result
            } else {
                log.error("Simulation service returned status {}", response.getStatusCode());
                return "ERROR";
            }
        } catch (Exception e) {
            log.error("Simulation call failed", e);
            throw new PharmaAppException("runSimulationCurve exception:" + e);
        }
    }


}
