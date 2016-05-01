import _ from 'lodash';

export default class ChannelReducer {

    constructor(channelType, channelResult) {

        return _.reduce(channelType, (seed, channel) => {
            if (!channel.is_archived && channel.unread_count) {
                if (channel.unread_count > 0) {
                    channelResult.push(channel);
                }
                seed += channel.unread_count;
            }
            return seed

        }, 0);

    }


};
