export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem
export PEER0_MANUFACTURER_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/manufacturer.pharma.com/peers/peer0.manufacturer.pharma.com/tls/ca.crt
export PEER0_DISTRIBUTOR_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/distributor.pharma.com/peers/peer0.distributor.pharma.com/tls/ca.crt
export PEER0_REGULATOR_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/regulator.pharma.com/peers/peer0.regulator.pharma.com/tls/ca.crt
export FABRIC_CFG_PATH=${PWD}/artifacts/channel/config/

export CHANNEL_NAME=pharmachannel

setGlobalsForPeer0Manufacturer(){
    export CORE_PEER_LOCALMSPID="ManufacturerMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_MANUFACTURER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/manufacturer.pharma.com/users/Admin@manufacturer.pharma.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

setGlobalsForPeer0Distributor(){
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

joinChannel(){
    setGlobalsForPeer0Manufacturer
   
    peer channel join -b ./artifacts/channel/pharmachannel.block

    
    setGlobalsForPeer0Distributor
    peer channel join -b ./artifacts/channel/pharmachannel.block
    
    setGlobalsForPeer0Regulator
   peer channel join -b ./artifacts/channel/pharmachannel.block
    
}

updateAnchorPeers(){
    setGlobalsForPeer0Manufacturer
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.pharma.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    
    setGlobalsForPeer0Distributor
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.pharma.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

    setGlobalsForPeer0Regulator
    peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer.pharma.com -c $CHANNEL_NAME -f ./artifacts/channel/${CORE_PEER_LOCALMSPID}anchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
    
}

joinChannel
#updateAnchorPeers
