package com.pharma.app.service;

import com.pharma.app.exception.PharmaAppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Date;

@Service
@Slf4j
public class DBServices {

    @Value("${db.driver}")
    private String dbDriver;
    @Value("${db.url}")
    private String dbUrl;

    @Value("${db.user}")
    private String dbUser;

    @Value("${db.pass}")
    private String dbPass;

    @Value("${db.hlf.event.table}")
    private String eventTable;



    public void insertEventData(String chaincodeName, String eventType, String eventName, String eventData, Date date) {
        try {
            final String JDBC_DRIVER = dbDriver;
            Class.forName(JDBC_DRIVER);
            Connection connection = DriverManager.getConnection(dbUrl, dbUser, dbPass);
            // Check if the table exists
            if (!doesTableExist(connection, eventTable)) {
                createEventDetailsTable(connection);
            }
            String sql = "INSERT INTO event_details (chaincodename, eventtype, eventname, eventdata, date) VALUES (?, ?, ?, ?, ?)";

            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            preparedStatement.setString(1, chaincodeName);
            preparedStatement.setString(2, eventType);
            preparedStatement.setString(3, eventName);
            preparedStatement.setString(4, eventData);
            preparedStatement.setDate(5, new java.sql.Date(date.getTime()));

            preparedStatement.executeUpdate();
            log.debug("Data inserted into event_details table.");
        } catch (Exception e) {
            log.debug("insertEventData exception:" + e);
            throw new PharmaAppException("insertEventData exception:" + e);
        }
    }
    private void createEventDetailsTable(Connection connection) {
        try {
            // Create the event_details table if it doesn't exist
            String createTableSQL = "CREATE TABLE event_details ("
                    + "chaincodename VARCHAR(255),"
                    + "eventtype VARCHAR(255),"
                    + "eventname VARCHAR(255),"
                    + "eventdata VARCHAR(255),"
                    + "date DATE)";

            PreparedStatement createTableStatement = connection.prepareStatement(createTableSQL);
            createTableStatement.executeUpdate();
            log.debug("event_details table created.");
        } catch (Exception e) {
            log.debug("createEventDetailsTable exception:" + e);
            throw new PharmaAppException("createEventDetailsTable exception:" + e);
        }
    }


    private boolean doesTableExist(Connection connection, String tableName) {
        try {
            // Check if the table exists in the database
            ResultSet tables = connection.getMetaData().getTables(null, null, tableName, null);
            boolean tableExists = tables.next();  // Check if there is at least one row
            tables.close();  // Close the ResultSet

            log.debug("Table exist:" + tableExists);
            return tableExists;
        } catch (Exception e) {
            log.debug("doesTableExist exception:" + e);
            throw new PharmaAppException("doesTableExist exception:" + e);
        }
    }


}
