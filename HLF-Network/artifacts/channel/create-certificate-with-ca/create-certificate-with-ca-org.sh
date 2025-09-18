source ../../../net-config.env

createcertificatesForOrg() {

  local ORG_NAME=$1
  local CA_PORT=$2
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/
  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/

   
  fabric-ca-client enroll -u https://admin:adminpw@localhost:${CA_PORT} --caname ca.${ORG_NAME}.pharma.com --tls.certfiles ${PWD}/fabric-ca/${ORG_NAME}/tls-cert.pem
   

  echo "NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-$CA_PORT-ca-$ORG_NAME-pharma-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-$CA_PORT-ca-$ORG_NAME-pharma-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-$CA_PORT-ca-$ORG_NAME-pharma-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-$CA_PORT-ca-$ORG_NAME-pharma-com.pem
    OrganizationalUnitIdentifier: orderer" >$PWD/../crypto-config/peerOrganizations/$ORG_NAME.pharma.com/msp/config.yaml


  echo
  echo "Register peer0"
  echo
  fabric-ca-client register --caname ca.${ORG_NAME}.pharma.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/${ORG_NAME}/tls-cert.pem

  echo
  echo "Register user"
  echo
  fabric-ca-client register --caname ca.${ORG_NAME}.pharma.com --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/fabric-ca/${ORG_NAME}/tls-cert.pem

  echo
  echo "Register the org admin"
  echo
  fabric-ca-client register --caname ca.${ORG_NAME}.pharma.com --id.name ${ORG_NAME}admin --id.secret ${ORG_NAME}adminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/${ORG_NAME}/tls-cert.pem

  mkdir -p ../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers

  # -----------------------------------------------------------------------------------
  #  Peer 0
  mkdir -p ../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com

  echo
  echo "## Generate the peer0 msp"
  echo
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:${CA_PORT} --caname ca.${ORG_NAME}.pharma.com -M ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/msp --csr.hosts peer0.${ORG_NAME}.pharma.com --tls.certfiles ${PWD}/fabric-ca/${ORG_NAME}/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:${CA_PORT} --caname ca.${ORG_NAME}.pharma.com -M ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/tls --enrollment.profile tls --csr.hosts peer0.${ORG_NAME}.pharma.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/${ORG_NAME}/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/tlsca/tlsca.${ORG_NAME}.pharma.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/peers/peer0.${ORG_NAME}.pharma.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/ca/ca.${ORG_NAME}.pharma.com-cert.pem

  # --------------------------------------------------------------------------------------------------

  mkdir -p ../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/users
  mkdir -p ../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/users/User1@${ORG_NAME}.pharma.com

  echo
  echo "## Generate the user msp"
  echo
  fabric-ca-client enroll -u https://user1:user1pw@localhost:${CA_PORT} --caname ca.${ORG_NAME}.pharma.com -M ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/users/User1@${ORG_NAME}.pharma.com/msp --tls.certfiles ${PWD}/fabric-ca/${ORG_NAME}/tls-cert.pem

  mkdir -p ../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/users/Admin@${ORG_NAME}.pharma.com

  echo
  echo "## Generate the org admin msp"
  echo
  fabric-ca-client enroll -u https://${ORG_NAME}admin:${ORG_NAME}adminpw@localhost:${CA_PORT} --caname ca.${ORG_NAME}.pharma.com -M ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/users/Admin@${ORG_NAME}.pharma.com/msp --tls.certfiles ${PWD}/fabric-ca/${ORG_NAME}/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/${ORG_NAME}.pharma.com/users/Admin@${ORG_NAME}.pharma.com/msp/config.yaml

}

sudo rm -rf ../crypto-config/*

for ((i = 0; i < ${#ORG_NAMES[@]}; i++)); do
  createcertificatesForOrg "${ORG_NAMES[i]}" "${CA_PORTS[i]}"
done





