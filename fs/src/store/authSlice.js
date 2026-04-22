import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
        id: null,
        name: null,
        email: null,
        phone_number: null
    },

    authStatus: 'idle', //loading, unauthenticated, authenticated
    isLoading: false

}


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginStart: (state, action) => {
            state.authStatus = 'loading'
            state.isLoading = true
        },

        loginSuccess: (state, action) => {
            // console.log(action.payload);
            state.user = action.payload;
            state.authStatus = 'authenticated'
            state.isLoading = false


        },

        verifyMeStart: (state, action) => {
            state.authStatus = 'loading'
            state.isLoading = true
        },

        verifyMeSuccess: (state, action) => {
            // console.log(action.payload);
            state.user = action.payload;
            state.authStatus = 'authenticated'
            state.isLoading = false
        },

        verifyMeFail: (state, action) => {
            state.authStatus = 'unauthenticated'
            state.isLoading = false
            // console.log(state.authStatus, state.isLoading);

        },

        clearAuthState: (state) => {
    state.user.id = null;
    state.user.name = null;
    state.user.email = null;
    state.user.phone_number = null;

    state.authStatus = "idle";
    state.isLoading = false;
}

    }
})

export const {
    loginStart, loginSuccess, verifyMeSuccess, verifyMeStart, verifyMeFail, clearAuthState
} = authSlice.actions;

export default authSlice.reducer;