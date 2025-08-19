#!/bin/bash

# Test CORS configuration
echo "Testing CORS configuration..."

# Test preflight request
echo "1. Testing OPTIONS preflight request..."
curl -X OPTIONS \
  -H "Origin: https://www.formcraft.digital" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v https://api.formcraft.digital/api/v1/forms

echo -e "\n\n2. Testing actual POST request..."
curl -X POST \
  -H "Origin: https://www.formcraft.digital" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Form","description":"Test","fields":[]}' \
  -v https://api.formcraft.digital/api/v1/forms

echo -e "\n\n3. Testing GET request..."
curl -X GET \
  -H "Origin: https://www.formcraft.digital" \
  -v https://api.formcraft.digital/api/v1/forms
