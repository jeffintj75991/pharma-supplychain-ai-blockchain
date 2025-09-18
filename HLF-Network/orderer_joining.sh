export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem


export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/tls/server.crt 

export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/tls/server.key 

osnadmin channel join --channelID pharmachannel --config-block ./artifacts/channel/pharmachannel.block -o localhost:7053 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY" 

export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer2.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem


export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer2.pharma.com/tls/server.crt 

export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer2.pharma.com/tls/server.key 

osnadmin channel join --channelID pharmachannel --config-block ./artifacts/channel/pharmachannel.block -o localhost:7055 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY"

########################

export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer3.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem


export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer3.pharma.com/tls/server.crt 

export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer3.pharma.com/tls/server.key 

osnadmin channel join --channelID pharmachannel --config-block ./artifacts/channel/pharmachannel.block -o localhost:7057 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY"


##########

export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem


export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/tls/server.crt 

export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/tls/server.key 

osnadmin channel list \
  -o localhost:7053 \
  --ca-file "$ORDERER_CA" \
  --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" \
  --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY"
