source ../../../net-config.env

createCertificatesForOrderer() {
  local CA_PORT=$1

  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/ordererOrganizations/pharma.com

  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/ordererOrganizations/pharma.com

   
  fabric-ca-client enroll -u https://admin:adminpw@localhost:9054 --caname ca-orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo "NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-$CA_PORT-ca-orderer.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-$CA_PORT-ca-orderer.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-$CA_PORT-ca-orderer.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-$CA_PORT-ca-orderer.pem
    OrganizationalUnitIdentifier: orderer" >$PWD/../crypto-config/ordererOrganizations/pharma.com/msp/config.yaml
   
  echo
  echo "Register the orderer admin"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name ordererAdmin --id.secret ordererAdminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  mkdir -p ../crypto-config/ordererOrganizations/pharma.com/orderers


  ordererNames=("$@")

  # Loop through orderer names and register each one
  for ordererName in "${ordererNames[@]}"; do

   fabric-ca-client register --caname ca-orderer --id.name $ordererName --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem

#-----------------------------------------------

  mkdir -p ../crypto-config/ordererOrganizations/pharma.com/orderers/$ordererName.pharma.com


  echo
  echo "## Generate the $ordererName msp"
  echo
  fabric-ca-client enroll -u https://${ordererName}:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/msp --csr.hosts ${ordererName}.pharma.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem

  cp ${PWD}/../crypto-config/ordererOrganizations/pharma.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/msp/config.yaml

  echo
  echo "## Generate the $ordererName-tls certificates"
  echo
  fabric-ca-client enroll -u https://${ordererName}:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/tls --enrollment.profile tls --csr.hosts ${ordererName}.pharma.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem

  cp ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/${ordererName}.pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem

  if [ "$ordererName" == "orderer" ]; then
    # Special case for "orderer"
    
  mkdir ${PWD}/../crypto-config/ordererOrganizations/pharma.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/pharma.com/orderers/orderer.pharma.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/pharma.com/msp/tlscacerts/tlsca.pharma.com-cert.pem

   fi

done

  mkdir -p ../crypto-config/ordererOrganizations/pharma.com/users
  mkdir -p ../crypto-config/ordererOrganizations/pharma.com/users/Admin@pharma.com

  echo
  echo "## Generate the admin msp"
  echo
   
  fabric-ca-client enroll -u https://ordererAdmin:ordererAdminpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/pharma.com/users/Admin@pharma.com/msp --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/pharma.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/pharma.com/users/Admin@pharma.com/msp/config.yaml

}

#createCertificatesForOrderer "9054" "orderer" "orderer2" "orderer3"
createCertificatesForOrderer "$ORDERER_PORT" "${ORDERER_ORGS[@]}"
