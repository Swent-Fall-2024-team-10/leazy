import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getUserProfile } from './ExampleApi'; 

interface User {
    name: string;
    activity: string;
}

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function fetchData() {
            const data = await getUserProfile();
            setUser(data);
        }
        fetchData();
    }, []);

    if (!user) {
        return <Text>Loading...</Text>;
    }

    return (
        <View>
            <Text>{user.name}</Text>
            <Text>{user.activity}</Text>
        </View>
    );
}
