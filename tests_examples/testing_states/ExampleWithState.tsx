import React from 'react'
import {View, Text, Button} from 'react-native'
import { useState } from 'react'

interface SimpleCounterProps {
    baseValue : number
}

// This component is a simple counter that increments the count when the button is pressed
export default function SimpleCounter({baseValue}: SimpleCounterProps) {
    const [count, setCount] = useState(baseValue)
    return (
        <View>
            <Text>{count}</Text>
            <Button title="Increment" onPress={() => setCount(count + 1)} />
        </View>
    )
}