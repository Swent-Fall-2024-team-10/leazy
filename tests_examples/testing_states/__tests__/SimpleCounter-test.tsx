import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import SimpleCounter from '../ExampleWithState'

// This simple test shows how to test a component that uses the useState hook 
// with the example of a button that increments a counter
describe('SimpleCounter', () => {
    test('base value should be the argument', () => {
        const { getByText } = render(<SimpleCounter baseValue={2} />)
        expect(getByText('2')).toBeTruthy()
    })

    test('increment button should increment the count', () => {
        const { getByText } = render(<SimpleCounter baseValue={0} />)
        expect(getByText('0')).toBeTruthy()

        fireEvent.press(getByText('Increment'))
        expect(getByText('1')).toBeTruthy()

        for (let i = 0; i < 5; i++) {
            fireEvent.press(getByText('Increment'))
        }
        expect(getByText('6')).toBeTruthy()
    })
})