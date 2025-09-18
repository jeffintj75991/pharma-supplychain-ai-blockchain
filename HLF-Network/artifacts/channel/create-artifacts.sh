source ../../net-config.env

createArtifacts() {
# Store paths in variables
ARTIFACTS_DIR="../../channel-artifacts"
CONFIG_PATH="."

# channel name defaults to "pharmachannel"
CHANNEL_NAME="pharmachannel"

# Use a loop for organizations passed as arguments
for ORG in "$@"; do
    echo "#######    Generating anchor peer update for $ORG  ##########"
    configtxgen -profile ChannelUsingRaft -configPath "$CONFIG_PATH" -outputAnchorPeersUpdate ./"$ORG"anchors.tx -channelID "$CHANNEL_NAME" -asOrg "$ORG"

done

# Generate channel configuration block

configtxgen -profile ChannelUsingRaft -configPath "$CONFIG_PATH" -channelID pharmachannel -outputBlock ./pharmachannel.block

echo "Script executed successfully."
}

# Call the function with the desired organizations
#createArtifacts "ManufacturerMSP" "DistributorMSP" "RegulatorMSP"
createArtifacts "${ORGS_MSPS[@]}"
