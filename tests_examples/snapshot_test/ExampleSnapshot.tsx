import React from 'react'
import {View, Text} from 'react-native'

interface ProfileProps {
    name: string
    activity : string
}

export default function Profile({name, activity}: ProfileProps) {
    return (
        <View>
            <Text>{name}</Text>
            <Text>{activity}</Text>
        </View>
    )
}