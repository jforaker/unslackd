import React from 'react-native';
const Progress = require('react-native-progress');

const {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
    Image
    } = React;

const stripText = (str) => {
    //remove slack specific strings like <he
    if (str === '') return `unslackd couldn't parse this message... prob not important :)`;
    return String(str)
        .replace(/</g, '')
        .replace(/>/g, '');
};

const MessageCell = ({message, onPress, isRefreshing, timestampRefreshing}) => (

    <TouchableHighlight underlayColor={'#F3FAFA'} onPress={() => onPress(message.channelId, message.ts, message)}>
        <View style={[styles.rowContainer]}>
            <Image style={styles.avatar} source={{uri: message.from.profile.image_192}} />

            <View style={styles.rowDetailsContainer}>
                <Text style={styles.left}>
                    {message.from.name}
                </Text>
                <Text style={styles.right}>
                    {stripText(message.message.text)}
                </Text>
            </View>

            <View style={styles.circles}>
                {/*IOS ONLY!!*/}
                {isRefreshing && (message.ts === timestampRefreshing) ?
                 <Progress.Circle
                    size={20}
                    borderColor={'#46CFDF'}
                    style={styles.progress}
                    indeterminate={true}
                    />
                    : null
                }

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
        flex: 8,
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

    circles: {
        flex: 0.75,
        margin: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    progress: {
        opacity: 0.9
    },
});

export default MessageCell