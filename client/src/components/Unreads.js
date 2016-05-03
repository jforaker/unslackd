import React from 'react-native';
import _ from 'lodash';
const NavigationBar = require('react-native-navbar');
const RefreshableListView = require('react-native-refreshable-listview');

import { Jumbotron } from './Jumbotron'
import EmptyView from './EmptyView.js'
import { LoadingView } from './LoadingView.js'
import Splash from './Splash'
import MessageCell from './MessageCell'
const markAll = require('../../assets/mark-all.png');
const refresh = require('../../assets/refresh.png');

var Swipeout = require('react-native-swipeout');


const {
    Component,
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    ListView,
    Image
    } = React;

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2, sectionHeaderHasChanged: (s1, s2) => s1 !== s2});
const headerColors = [
    '#DF466A',
    '#46CFDF',
    '#DF8246'
];

export default class Unreads extends Component {

    constructor(props) {
        super(props);
        this.dataSource = ds;
        this.renderMessageCell = this.renderMessageCell.bind(this);
        this.renderSectionHeaderView = this.renderSectionHeaderView.bind(this);
        this.renderSeparatorView = this.renderSeparatorView.bind(this);
        this.checkTotalAndRender = this.checkTotalAndRender.bind(this);
        this.onMessagePress = this.onMessagePress.bind(this);
        this.createRowsWithHeaders = this.createRowsWithHeaders.bind(this);
        this.refreshList = this.refreshList.bind(this)
    }

    componentDidMount() {
        //dont call getUnreads again if coming from login.
        if(!this.props.route.passProps){
            this.props.getUnreads(this.props.user.token, true);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.user.logged_in && nextProps.user.logging_out) {
            this.props.navigator.replace({
                component: Splash,
                passProps: {authed: false}
            })
        }
    }

    refreshList(showLoader) {
        this.props.getUnreads(this.props.user.token, showLoader);
    }

    onMessagePress(channelId, ts, rowData) {
        const { user } = this.props;
        this.props.markAsRead(user.token, channelId, ts, user.unreads, rowData);
    }

    renderMessageCell(message) {
        const { user } = this.props;
        const isRefreshing = user.unreads_refreshing;
        const timestampRefreshing = user.msg_timestamp;

        var swipeoutBtns = [
            {
                text: 'Button'
            }
        ];

        /*
         <Swipeout
         close
         left={swipeoutBtns}
         onOpen={this.onPress.bind(null, message.channelId, message.ts, message)}>
         <MessageCell key={message.ts}
         message={message}
         isRefreshing={isRefreshing}
         timestampRefreshing={timestampRefreshing}
         />
         </Swipeout>
         */


        return (
            <MessageCell key={message.ts}
                         message={message}
                         onPress={this.onMessagePress}
                         isRefreshing={isRefreshing}
                         timestampRefreshing={timestampRefreshing}/>
        )
    }

    createRowsWithHeaders(data) {
        let dataBlob = {};

        if (data && !_.isEmpty(data)) {
            _.each(data.messages, (val, key) => {
                _.each(val, channelObj => {
                    if (channelObj.JakesMessages.messages.length) {
                        //bot messages vary too much in data structure, too hard to parse

                        //const mm = _.without(users) without current users (nabil)

                        console.log('channelObj.JakesMessages.messages', channelObj.JakesMessages.messages);
                        const messages = _.map(channelObj.JakesMessages.messages, msg => {
                            let from = {};

                            if (msg.bot_id){
                                const icon = msg.icons ? msg.icons.image_64 : 'https://placeimg.com/192/192/bot';
                                _.assign(from, {name: 'Slackbot', profile: {image_192: icon}});
                            } else {
                                from = _.find(data.users, {id: msg.user});
                            }

                            console.log('from', from);

                            if (from){

                            }

                            return {
                                message: msg,
                                channelId: channelObj.id,
                                ts: msg.ts,
                                type: key,
                                from: from
                            }
                        });
                        const header = channelObj.name || `dm from ${_.find(data.users, {id: channelObj.user}).name}`;
                        dataBlob[header] = _.orderBy(messages, ['ts'], ['asc']);
                    }
                });
            })
        }
        return dataBlob
    }

    renderSeparatorView(sectionID, rowID) {
        return (
            <View key={`${sectionID}-${rowID}`} style={ styles.separator }/>
        );
    }

    renderSectionHeaderView(sectionData, sectionID) {
        const { markAsRead, user } = this.props;
        const last = _.last(sectionData);
        const key = last.ts;
        const color = (last.from && last.from.color) ? `#${last.from.color}` : _.first(headerColors);

        return (
            <View style={[styles.header, {backgroundColor: color}]} key={key}>
                <Text style={[styles.headerTitle]}>
                    {sectionID}
                </Text>
                <TouchableHighlight underlayColor={'transparent'}
                                    onPress={() => markAsRead(user.token, last.channelId, last.message.ts, user.unreads, last)}>
                    <Image source={markAll} />
                </TouchableHighlight>
            </View>
        );
    }

    checkTotalAndRender() {
        const { user, getUnreads } = this.props;
        const dataSource = this.dataSource.cloneWithRowsAndSections(this.createRowsWithHeaders(user.unreads));

        if (user.unreads && user.unreads.total > 0) {
            return (
                <View style={styles.container}>

                    <Jumbotron user={user} />

                    <RefreshableListView
                        hasData={user.unreads.total > 0}
                        dataSource={dataSource}
                        renderRow={this.renderMessageCell}
                        renderSectionHeader={this.renderSectionHeaderView}
                        renderSeparator={(sectionID, rowID) => this.renderSeparatorView(sectionID, rowID)}
                        isRefreshing={user.unreads_loading}
                        loadData={() => getUnreads(user.token, false)}
                        refreshDescription=""
                    />
                </View>
            )
        } else {
            return <EmptyView {...this.props} />
        }
    }

    render() {

        const rightButton = {
            title: 'Logout', //<Image source={refresh}/>
            handler: () => this.props.doLogout()
        };

        if (this.props.user.unreads_loading) {
            return <LoadingView />
        }

        return (
            <View style={styles.container}>
                <NavigationBar
                    rightButton={rightButton} />
                {this.checkTotalAndRender()}
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 20
    },
    separator: {
        height: 1,
        backgroundColor: '#CCCCCC',
    },
    header: {
        padding: 10,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        flex: 1,
    },

});
