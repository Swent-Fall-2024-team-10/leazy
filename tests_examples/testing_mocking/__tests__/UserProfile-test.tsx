import React from 'react';
import { act, render, RenderAPI, waitFor } from '@testing-library/react-native';
import UserProfile from '../UserProfile'; 
import { getUserProfile } from '../ExampleApi'; 

/**
 * This is creating a mock for the getUserProfile function.
 * This is done to avoid making actual API calls in the test
 * jest.mock takes as arguments the path to the module to mock 
 * and a function that returns the mock, here we are using jest.fn()
 * which creates a new mock function that we can use to simulate the
 * getUserProfile function behavior in our tests
 */ 

jest.mock('../ExampleApi', () => ({
    getUserProfile: jest.fn(),
}));

describe('UserProfile Component', () => {
    test('renders user data after fetch', async () => {

        // We are using the jest.mock function to mock the getUserProfile function
        // getUserProfile is a reference to the mock function created in the jest.mock call
        // we use "as jest.Mock" is used in order to cast the type of  the function to a 
        // mock function. Then we add a mockResolvedValueOnce to the mock function to simulate
        // the result of the API call. This will make the getUserProfile function return the
        // object { name: 'John Doe', activity: 'Coding' } when called.
        // without having to make an actual API call.
        (getUserProfile as jest.Mock).mockResolvedValueOnce({
            name: 'John Doe',
            activity: 'Coding',
        });
    
        const renderResult = render(<UserProfile />);
        const { getByText } = renderResult;
    
        // We are using the waitFor function from @testing-library/react-native to wait for the
        // component to render the user data after the fetch. This is necessary because the fetch
        // is done asynchronously and we need to wait for the component to update with the new data.
        await waitFor(() => {
            expect(getByText('John Doe')).toBeTruthy();
            expect(getByText('Coding')).toBeTruthy();
        });
    });
});