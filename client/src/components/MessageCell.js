import React from 'react-native';

const {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
    Image
    } = React;

const MessageCell = ({message, _onPress}) => (
    <TouchableHighlight underlayColor={'#f3f3f2'} onPress={() => _onPress(message.channelId, message.ts, message)}>
        <View style={[styles.rowContainer]}>
            <Image style={styles.avatar} source={{uri: message.from.profile.image_192}} />

            <View style={styles.rowDetailsContainer}>
                <Text style={styles.left}>
                    {message.from.name}
                </Text>
                <Text style={styles.right}>
                    {message.message.text}
                </Text>
            </View>
        </View>
    </TouchableHighlight>
);


const styles = StyleSheet.create({
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10
    },
    left: {
        fontSize: 15,
        textAlign: 'left',
        color: '#000000',
        marginLeft: 15,
    },
    rowDetailsContainer: {
        flex: 1,
    },
    right: {
        fontSize: 15,
        textAlign: 'left',
        marginLeft: 15,
        color: 'gray',
    },
    avatar: {
        width: 48,
        height: 48,
    },
});

export default MessageCell