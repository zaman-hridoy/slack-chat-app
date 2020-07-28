import React, { Component } from 'react';
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

export default class MessagesHeader extends Component {
    render() {

        const { displayChannelName, numOfUniqueUsers, handleSearchChange, searchLoading, isPrivate, handleStar, isChannelstarred } = this.props;

        return (
            <Segment clearing>
                {/* Channel Title */}
                <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
                    <span>
                        {displayChannelName}
                        {!isPrivate && (
                            <Icon 
                                name={isChannelstarred ? 'star': 'star outline'} 
                                onClick={handleStar} 
                                color={isChannelstarred ? 'yellow': 'black'} 
                            />
                        )}
                    </span>
                    <Header.Subheader>{numOfUniqueUsers}</Header.Subheader>
                </Header>

                {/* Channel Search Input */}
                <Header floated="right">
                    <Input 
                        loading={searchLoading}
                        onChange={handleSearchChange}
                        size="mini"
                        icon="search"
                        name="searchIcon"
                        placeholder="Search Messages"
                    />
                </Header>
            </Segment>
        )
    }
}
