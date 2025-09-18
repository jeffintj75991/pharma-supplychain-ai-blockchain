find . -type f -name "*.sh" -exec chmod 777 {} \; &&

echo "Setting up hyperledger fabric network..."
cd $PWD/artifacts/channel/create-certificate-with-ca/ 
echo "Setting up Certificate organisations..."
docker-compose up -d &&
echo "Setting up Certificates..."
./create-certificate-with-ca-org.sh &&
./create-certificate-with-ca-orderer.sh &&
cd ..
echo "Setting up channel artifacts..."
./create-artifacts.sh &&
cd ..
echo "Setting up Peer organisations..."
docker-compose up -d && 
cd ..
echo "Joining the orderers to the channel.."
./orderer_joining.sh &&   
sleep 15 &&  
echo "Setting up channel..."               
./createChannel.sh &&
sleep 3 &&
echo "Pharma chaincode deployment.."               
./deployPharmaCC.sh &&

echo "Hyperledger fabric network setup is completed"
 
