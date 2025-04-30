PASSWORD='<Your Password>'
# Change this to a real email if you'd like to log into the tenant
ID=$RANDOM
TENANT_EMAIL="derric-$ID@moesif.com" 
CONTROL_PLANE_STACK_NAME="ControlPlaneStack"
TENANT_ID="$ID"
TENANT_NAME="tenant-$ID"

CLIENT_ID="XXXXXXX"
USER_POOL_ID="XXXXXX"
USER="admin"
CONTROL_PLANE_API_ENDPOINT='https://XXXXX.execute-api.us-west-1.amazonaws.com/prod/'

# required in order to initiate-auth
aws cognito-idp update-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-id "$CLIENT_ID" \
    --explicit-auth-flows USER_PASSWORD_AUTH

# remove need for password reset
aws cognito-idp admin-set-user-password \
    --user-pool-id "$USER_POOL_ID" \
    --username "$USER" \
    --password "$PASSWORD" \
    --permanent

# get credentials for user
AUTHENTICATION_RESULT=$(aws cognito-idp initiate-auth \
    --auth-flow USER_PASSWORD_AUTH \
    --client-id "${CLIENT_ID}" \
    --auth-parameters "USERNAME=${USER},PASSWORD=${PASSWORD}" \
    --query 'AuthenticationResult')

ID_TOKEN=$(echo "$AUTHENTICATION_RESULT" | jq -r '.IdToken')
echo "ID_TOKEN: $ID_TOKEN"

DATA=$(jq --null-input \
    --arg tenantName "$TENANT_NAME" \
    --arg tenantEmail "$TENANT_EMAIL" \
    --arg tenantId "$TENANT_ID" \
    '{
  "tenantName": $tenantName,
  "email": $tenantEmail,
  "firstName":  $tenantName,
  "tier": "basic",
  "tenantId": $tenantId,
  "tenantStatus": "In progress",
  "priceId": "price_1OwqOsJJZVqKhNiBNNIYtEhy",
  "planId": "8ad099a98b5badbf018b5e2840f014bd",
  "address": {
    "state": "MI"
  }
}')

echo "creating tenant..."
curl --request POST \
    --url "${CONTROL_PLANE_API_ENDPOINT}tenants" \
    --header "Authorization: Bearer ${ID_TOKEN}" \
    --header 'content-type: application/json' \
    --data "$DATA"
echo "" # add newline

echo "retrieving tenant..."
curl --request GET \
    --url "${CONTROL_PLANE_API_ENDPOINT}tenants/${TENANT_ID}" \
    --header "Authorization: Bearer ${ID_TOKEN}" \
    --silent | jq
