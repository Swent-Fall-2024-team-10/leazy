import React from 'react';
import { render } from '@testing-library/react-native';
import UnitExample from '../UnitTestComponent';

// This create a single test
test('Unit test basic example', 
    () => {
        // We use the render function in order to render the tested component
        // and use the getByText function to get the text of the component
        const { getByText } = render(<UnitExample />);
        getByText('Hello Adrien!');
    })

// If we wanted to create a test suite we would have used : 
describe('Unit test suite', () => {
    //Here we would have put all the tests we want to run in the suite
    test('Unit test basic example', () => {
        const { getByText } = render(<UnitExample />);
        getByText('Hello Adrien!');
    })

    test('Unit test basic example 2', () => {
        const { getByText } = render(<UnitExample />);
        getByText('Hello Adrien!');
    })
});

    // We could have added more tests in the suite if we wanted to
//Note that these two tests are the same, the only difference is that the first one is a single test
// and the second one is a test suite containing a single test but we could have added more tests in the suite
// if we wanted to.