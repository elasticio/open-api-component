# OpenAPI/Swagger Component"
## Table of Contents

* [General information](#general-information)
   * [Description](#description)
   * [Purpose](#purpose)
   * [Completeness Matrix](#completeness-matrix)
   * [How works. API version/SDK version](#how-works-api-version--sdk-version)
* [Credentials](#credentials)
     * [Type](#type)
     * [A URL to an OpenAPI/Swagger document](#a-url-to-an-openapiswagger-document)
* [Actions](#actions)
   * [Make Request](#make-request)
* [Additional info](#additional-info)
* [Known Limitations](#known-limitations)

## General information
### Description
OpenAPI Specification (formerly Swagger Specification) is an API description format for REST APIs.
OpenAPI (Swagger) document needs to be hosted online and should be reached without authentication. You need to provide a URL to this document in the credentials.
### Purpose
Using OpenAPI Specification make request to REST API on elastic.io platform.
### Completeness Matrix
![image](https://user-images.githubusercontent.com/16806832/73257112-da9b5180-41cb-11ea-83d9-2725552185f7.png)
[Completeness Matrix](https://docs.google.com/spreadsheets/d/1S3B7caVck0IjR-jU-EX5gZDLBcL9L6dTRKPxoNxYApU/edit#gid=0)
### How works. API version / SDK version
Currently, it is supported OpenAPI version 2.0 documents.
It is used [Swagger Client](https://github.com/swagger-api/swagger-js) version 3.10.0.
[OpenAPI Specification](https://swagger.io/docs/specification/about/).

## Credentials
  ![image](https://user-images.githubusercontent.com/16806832/73258248-fa337980-41cd-11ea-8c8a-daf9a22360ec.png)
  ### Type
  Authentication type field to define the authentication schema that would be used for making request. 
  It is supported 3 auth type:
   - `No Auth` - used by default, make request without authentication.
   - `Basic Auth` - make request with basic authentication, `Username` and `Password` fields should be specified:
   ![image](https://user-images.githubusercontent.com/16806832/73258339-2a7b1800-41ce-11ea-894a-98fa65e37b81.png)
   - `API Key Auth` - make request with API key in headers authentication, `Header Name` and `Header Value` fields should be specified:
   ![image](https://user-images.githubusercontent.com/16806832/73258541-93629000-41ce-11ea-899d-6d1531df3fa1.png)
  ### A URL to an OpenAPI/Swagger document
  A URL to an OpenAPI/Swagger document that would define the calls that could be made, as example https://petstore.swagger.io/v2/swagger.json

## Actions
  ### Make Request
  ![image](https://user-images.githubusercontent.com/16806832/73259337-467fb900-41d0-11ea-86af-e18f373a29ec.png)
   #### List of Expected Config fields
   ##### Path
   A dropdown for the paths than defined in the OpenAPI document.
   ##### Operation
   A dropdown for the operations that are allowed for a previously defined path.
   ##### Don`t throw Error on Failed Calls
   An option as to whether or not errors should be thrown for HTTP codes in the 4xx/5xx range.
   #### Expected input metadata
   Input metadata is depend on parameters, that are defined in [operation](https://swagger.io/docs/specification/2-0/describing-parameters/):
   `path parameters` are defined as a separate fields, and `body` as object that should be configured by user.
   For example, path `/pet/{petId}` and operation `get` metadata is:
   ```json
     {
       "type": "object",
       "properties": {
         "petId": {
           "type": "integer",
           "required": true
         }
       }
     }
```
   <details> 
     <summary>OpenApi Description for path `/pet/{petId}` and operation `get`</summary>     
    
     {
       "paths": {
         "/pet/{petId}": {
           "get": {
             "tags": [
               "pet"
             ],
             "summary": "Find pet by ID",
             "description": "Returns a single pet",
             "operationId": "getPetById",
             "produces": [
               "application/json",
               "application/xml"
             ],
             "parameters": [
               {
                 "name": "petId",
                 "in": "path",
                 "description": "ID of pet to return",
                 "required": true,
                 "type": "integer",
                 "format": "int64"
               }
             ],
             "responses": {
               "200": {
                 "description": "successful operation",
                 "schema": {
                   "$ref": "#/definitions/Pet"
                 }
               },
               "400": {
                 "description": "Invalid ID supplied"
               },
               "404": {
                 "description": "Pet not found"
               }
             },
             "security": [
               {
                 "api_key": []
               }
             ]
           }
         }
       }
     }
    
   </details>
   
   #### Expected output metadata
   ```json
     {
         "type": "object",
         "properties": {
           "headers": {
             "type": "object",
             "properties": {},
             "required": true
           },
           "body": {
             "type": "object",
             "properties": {},
             "required": true
           },
           "responseCode": {
             "type": "number",
             "required": true
           }
         }
       }
```
## Known limitations (common for the component)
 - OpenApi v2.0 is supported
 - Multiply hosts is unsupported
 - Each operation should contains only one tag
 - Authentication for access to OpenAPI (Swagger) file is unsupported
