import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user : {
        id : null,
        name : null,
        email : null,
        phone_number : null
    },

    authStatus : 'idle', //loading, unauthenticated, authenticated
    isLoading : false

}


const authSlice = createSlice({
    name : "auth", 
    initialState, 
    reducers : {
        loginStart : (state, action) => {
                state.authStatus = 'loading'
                state.isLoading = true
        },

        loginSuccess : (state, action) => {
                console.log(action.payload);
                state.user = action.payload;
                state.authStatus = 'authenticated'
                state.isLoading = false
           
                
        },

        verifyMeStart : (state, action)=> {
                state.authStatus = 'loading'
                state.isLoading = true
        },

        verifyMeSuccess: (state, action) => {
            console.log(action.payload);
                state.user = action.payload;
                state.authStatus = 'authenticated'
                state.isLoading = false
        }, 

         verifyMeFail: (state, action) => {
                state.authStatus = 'unauthenticated'
                state.isLoading = false
                console.log(state.authStatus, state.isLoading);
                
        }, 



    }
})

export const {
    loginStart, loginSuccess, verifyMeSuccess, verifyMeStart, verifyMeFail
} = authSlice.actions;

export default authSlice.reducer;