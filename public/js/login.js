/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';


export const login = async (email, password) => {
    // here we do request, we will also see how we can send data directly from an HTML
    // form into our Node application so there are two ways.
    // 1) one way is to send data using an HTTP request like we did here.
    // 2) directly use an HTML Form. this one is very important as well
    try {
        // asios here returns a promise
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }

    // one thing that is really good about axios is that it is going to throw an error
    // whenever we get an error back from our API endpoint
    // so for example there is a wrong password server will send back a 403 error. and 
    // whenever there is an error axios will trigger an error as well.
};


export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',
        });
        // next step is to also reload the page. that is what we also do manually when we 
        // delete a cookie. and so we need to do it programatically. and we need to do it
        // here because since this is AJAX request we can not do it on the back end side.
        // so, we can't do it with express. so we need to of course do it manually here.
        // otherwise we would technically be logged out but our user manu would still 
        // reflect/show that we are logged in. so we simply need to reload the page.
        // which will then send the invalid cookie to the server. so that one that we just 
        // received without a token and then we are no longer logged in and therefore then
        // our user menu will disappear 
        if (res.data.status === 'success') {
            location.reload(true);
            // 'true' and that will then force a reload from the server and not from 
            // browser cache which will then still have our user manu up there. and that is 
            // not what we want, we really want a fresh page coming down from server.
        }
    } catch (err) {
        console.log(err.response);
        showAlert('error', 'Error logging out! Try again.');
    }
}