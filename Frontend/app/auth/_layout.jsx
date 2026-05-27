import { Stack, Redirect } from 'expo-router'
import { useSelector } from 'react-redux';

const AuthLayout = () => {
    const user = useSelector(state => state.user);
    if(user.username) return(<Redirect href={"/(drawer)/home"} />)
    return (
        <Stack screenOptions={{headerShown: false}}></Stack>
    )
}

export default AuthLayout