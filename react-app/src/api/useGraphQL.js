/*
Copyright 2020 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
import {useState, useEffect} from 'react';

const { NODE_ENV, REACT_APP_HOST_URI, REACT_APP_GRAPHQL_ENDPOINT, REACT_APP_AUTHORIZATION } = process.env;

/*
    Custom React Hook to perform a GraphQL query
    query paramter is a GraphQL query
    environment variable REACT_APP_GRAPHQL_ENDPOINT is used to point to endpoint in AEM
*/
function useGraphQL(query) {

    let [data, setData] = useState(null);
    let [errorMessage, setErrors] = useState(null);

    useEffect(() => {
        window.fetch(
            getRequestUrl(), 
            getRequestOptions(query)
        ).then(response => response.json())
        .then(({data, errors}) => {
            //If there are errors in the response set the error message
            if(errors) {
                setErrors(mapErrors(errors));
            }
            //Otherwise if data in the response set the data as the results
            if(data) {
                setData(data);
            }
        })
        .catch((error) => {
            setErrors(error);
        });
    }, [query]);

    return {data, errorMessage}
}

/**
 * Get the request uri based on environment variables
 */
function getRequestUrl() {

    if(NODE_ENV === 'development') {
        // always use a relative url during development so the proxy is used at setupProxy.js
        return REACT_APP_GRAPHQL_ENDPOINT;
    }

    // use an absolute URL for everything else
    return REACT_APP_HOST_URI + REACT_APP_GRAPHQL_ENDPOINT;
}

/**
 * Set the GraphQL endpoint based on environment variables and passed in query
 * @param {*} query 
 */
function getRequestOptions(query) {

    // headers and include authorization if authorization set
    let httpHeaders = new Headers();
    httpHeaders.append('Content-Type', 'application/json');
    if(REACT_APP_AUTHORIZATION) {
        httpHeaders.append('Authorization', 'Basic ' + btoa(REACT_APP_AUTHORIZATION))
    }

    return  {
        method: 'POST',
        headers: httpHeaders,
        body: JSON.stringify({query}),
    };
}

/**
 * concatenate error messages into a single string.
 * @param {*} errors 
 */
function mapErrors(errors) {
    return errors.map((error) => error.message).join(",");
}
export default useGraphQL