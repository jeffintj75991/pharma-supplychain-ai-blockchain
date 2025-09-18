export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem
export PEER0_MANUFACTURER_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/manufacturer.pharma.com/peers/peer0.manufacturer.pharma.com/tls/ca.crt
export PEER0_DISTRIBUTOR_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/distributor.pharma.com/peers/peer0.distributor.pharma.com/tls/ca.crt
export PEER0_REGULATOR_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/regulator.pharma.com/peers/peer0.regulator.pharma.com/tls/ca.crt
export FABRIC_CFG_PATH=${PWD}/artifacts/channel/config/

setGlobalsForOrderer() {
    export CORE_PEER_LOCALMSPID="OrdererMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/users/Admin@pharma.com/msp

}

setGlobalsForPeer0Manufacturer() {
    export CORE_PEER_LOCALMSPID="ManufacturerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_MANUFACTURER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/manufacturer.pharma.com/users/Admin@manufacturer.pharma.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

setGlobalsForManufacturer() {
    export CORE_PEER_LOCALMSPID="ManufacturerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_MANUFACTURER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/manufacturer.pharma.com/users/User1@manufacturer.pharma.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

setGlobalsForPeer0Distributor() {
    export CORE_PEER_LOCALMSPID="DistributorMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_DISTRIBUTOR_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/distributor.pharma.com/users/Admin@distributor.pharma.com/msp
    export CORE_PEER_ADDRESS=localhost:9051

}

setGlobalsForPeer0Regulator(){
    export CORE_PEER_LOCALMSPID="RegulatorMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_REGULATOR_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/regulator.pharma.com/users/Admin@regulator.pharma.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
    
}

export CHANNEL_NAME=pharmachannel
export COLL_CONFIG=${PWD}/artifacts/src/github.com/pharma_privateCollection.json
CC_RUNTIME_LANGUAGE="node"
VERSION="1"
SEQUENCE="1"
CC_SRC_PATH="./artifacts/src/github.com/pharma-chaincode"
CC_NAME="pharma-cc"

packageChaincode() {
    rm -rf ${CC_NAME}.tar.gz
    setGlobalsForPeer0Manufacturer
    peer lifecycle chaincode package ${CC_NAME}.tar.gz \
        --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} \
        --label ${CC_NAME}_${VERSION}
    echo "===================== Chaincode is packaged ===================== "
}

installChaincode() {
    setGlobalsForPeer0Manufacturer
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.manufacturer ===================== "
setGlobalsForPeer0Distributor
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.distributor ===================== "

    setGlobalsForPeer0Regulator
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.regulator ===================== "

}


queryInstalled() {
    setGlobalsForPeer0Manufacturer
    peer lifecycle chaincode queryinstalled >&log.txt
    cat log.txt
    PACKAGE_ID=$(sed -n "/${CC_NAME}_${VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    echo PackageID is ${PACKAGE_ID}
    echo "===================== Query installed successful on peer0.manufacturer on channel ===================== "
}


approveForMyManufacturer() {
    setGlobalsForPeer0Manufacturer
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.pharma.com --tls \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE} --collections-config ${COLL_CONFIG}

    echo "===================== chaincode approved from org 1 ===================== "

}

checkCommitReadiness1() {
    setGlobalsForPeer0Manufacturer

	peer lifecycle chaincode checkcommitreadiness  --collections-config ${COLL_CONFIG} --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
 	--sequence ${SEQUENCE} --output json
   
    echo "===================== checking commit readyness from org 1 ===================== "
}

approveForMyDistributor() {
    setGlobalsForPeer0Distributor

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.pharma.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE} --collections-config ${COLL_CONFIG}

    echo "===================== chaincode approved from org 2 ===================== "
}

checkCommitReadiness2() {

    setGlobalsForPeer0Distributor
   peer lifecycle chaincode checkcommitreadiness  --collections-config ${COLL_CONFIG} --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
 	--sequence ${SEQUENCE} --output json
    echo "===================== checking commit readyness from org 2 ===================== "
}

approveForMyRegulator() {
    setGlobalsForPeer0Regulator

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.pharma.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --package-id ${PACKAGE_ID} \
        --sequence ${SEQUENCE} --collections-config ${COLL_CONFIG}

    echo "===================== chaincode approved from org 3 ===================== "
}

checkCommitReadiness3() {

    setGlobalsForPeer0Regulator
   peer lifecycle chaincode checkcommitreadiness  --collections-config ${COLL_CONFIG} --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
 	--sequence ${SEQUENCE} --output json
    echo "===================== checking commit readyness from org 3 ===================== "
}

commitChaincodeDefination() {
    setGlobalsForPeer0Manufacturer
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.pharma.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DISTRIBUTOR_CA \
        --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_REGULATOR_CA \
        --version ${VERSION} --sequence ${SEQUENCE} --collections-config ${COLL_CONFIG} 

}

queryCommitted() {
    setGlobalsForPeer0Manufacturer
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME} --collections-config ${COLL_CONFIG}

}


chaincodeInvoke() {
   setGlobalsForPeer0Manufacturer
echo "first invoke"
peer chaincode invoke -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.pharma.com \
  --tls $CORE_PEER_TLS_ENABLED \
  --cafile $ORDERER_CA \
  -C $CHANNEL_NAME -n ${CC_NAME}  \
  --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
  --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DISTRIBUTOR_CA \
  --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_REGULATOR_CA \
  -c '{"Args":["CreateBatch","BATCH100000001","DrugX","2025-09-09","2027-09-09"]}'


sleep 3
  ###################################################

echo "second invoke"

  SIM_DATA=$(echo -n '{"modelVersion":"v1.0","curve":[[25,100],[40,80]],"notes":"accelerated stability"}' | base64 | tr -d '\n')


    peer chaincode invoke \
  -o localhost:7050 --ordererTLSHostnameOverride orderer.pharma.com \
  --tls --cafile $ORDERER_CA \
  -C $CHANNEL_NAME -n ${CC_NAME} \
  --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
  -c '{"Args":["AddSimulationResult","BATCH100000001"]}' \
  --transient "{\"simulation\":\"$SIM_DATA\"}"



sleep 3
  ###########################################################
  echo "third invoke"

   SIM_DATA=$(echo -n '{"temperature":4,"humidity":60,"timestamp":"2025-09-09T10:05:00Z"}' | base64 | tr -d '\n')



  peer chaincode invoke \
  -o localhost:7050 --ordererTLSHostnameOverride orderer.pharma.com \
  --tls --cafile $ORDERER_CA \
  -C $CHANNEL_NAME -n ${CC_NAME} \
  --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
  --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DISTRIBUTOR_CA \
  -c '{"Args":["RecordTransport","BATCH100000001"]}' \
  --transient "{\"transport\":\"$SIM_DATA\"}" 


sleep 3
  ######################################################################

echo "fourth invoke"

SIM_DATA=$(echo -n '{"spoiled":true,"risk":"Yes"}' | base64 | tr -d '\n')


peer chaincode invoke \
  -o localhost:7050 --ordererTLSHostnameOverride orderer.pharma.com \
  --tls --cafile $ORDERER_CA \
  -C $CHANNEL_NAME -n ${CC_NAME} \
  --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
  --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DISTRIBUTOR_CA \
  -c '{"Args":["AddPredictionResult","BATCH100000001"]}' \
  --transient "{\"prediction\":\"$SIM_DATA\"}" 

sleep 3
#########################################################################
echo "fifth invoke"
 setGlobalsForPeer0Manufacturer
SIM_DATA=$(echo -n '{"status":"APPROVED","remarks":"All good","timestamp":"2025-09-09T10:15:00Z"}' | base64 | tr -d '\n')

peer chaincode invoke \
  -o localhost:7050 --ordererTLSHostnameOverride orderer.pharma.com \
  --tls --cafile $ORDERER_CA \
  -C $CHANNEL_NAME -n ${CC_NAME} \
  --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_MANUFACTURER_CA \
  --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_REGULATOR_CA \
  -c '{"Args":["AuditBatch","BATCH100000001"]}' \
  --transient "{\"audit\":\"$SIM_DATA\"}"

  sleep 3

}

chaincodeQuery() {
  echo -e "\n"
  echo "GetBatch"
    setGlobalsForPeer0Manufacturer
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME}   -c '{"Args":["GetBatch","BATCH100000001"]}'

echo -e "\n"
  echo "GetBatchDetails"
sleep 2
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME}  \
  -c '{"Args":["GetBatchDetails","BATCH100000001"]}'

echo -e "\n"
  echo "ListAllBatches"

sleep 2
  peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} \
  -c '{"Args":["ListAllBatches"]}'


echo -e "\n"
  echo "GetAuditDetails"

sleep 3
  peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} \
  -c '{"Args":["GetAuditDetails","BATCH100000001"]}'


}



packageSetup(){
    cd ${PWD}/artifacts/src/github.com/pharma-chaincode
    npm install 
    cd -
}

packageSetup &&
packageChaincode
installChaincode
queryInstalled
approveForMyManufacturer
checkCommitReadiness1
approveForMyDistributor
checkCommitReadiness2
approveForMyRegulator
checkCommitReadiness3
commitChaincodeDefination
sleep 3
chaincodeInvoke
sleep 3
chaincodeQuery
