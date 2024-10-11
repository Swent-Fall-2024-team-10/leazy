import React from 'react'
import { View, Text} from 'react-native'

interface GreetingProps {
    name : String
    isMorning : Boolean
}

export default function Greeting({name, isMorning} : GreetingProps) {
    return (
        <View>
            <Text> {isMorning ? 'Good Morning' : 'Good Afternoon'}, {name}! </Text>
        </View>
    )
}