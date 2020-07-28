import React, { Component } from 'react';
import { Segment, Header, Accordion, Icon, Image, List } from 'semantic-ui-react';

export default class MetaPanel extends Component {

    state = {
        activeIndex: 0,
        isPrivate: this.props.isPrivate,
        currentChannel: this.props.currentChannel
    }

    setActiveIndex = (event, titleProps) => {
        const { index } = titleProps;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;
        this.setState({ activeIndex: newIndex });
    }

    formatCount = num => (num > 1 || num === 0) ? `${num} posts` : `${num} post`;

    displayTopPosters = posts => (
        Object.entries(posts)
                .sort((a,b) => b[1]-a[1])
                .map(([key, value], index) => (
                    <List.Item key={index}>
                        <Image avatar src={value.avatar} />
                        <List.Content>
                            <List.Header as="a">{key}</List.Header>
                            <List.Description>{this.formatCount(value.count)}</List.Description>
                        </List.Content>
                    </List.Item>
                )).slice(0, 5)
    )

    render() {
        const { activeIndex, isPrivate, currentChannel } = this.state;
        const { userPosts } = this.props;
        if(isPrivate || !currentChannel) return null;
        return (
            <Segment>
                <Header as="h3" attached="top">
                    About # {currentChannel.name}
                </Header>
                <Accordion styled attached="true">
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name="dropdown" />
                        <Icon name="info" />
                        Channel Details
                    </Accordion.Title>

                    <Accordion.Content active={activeIndex === 0}>
                        {currentChannel.details}
                    </Accordion.Content>

                    <Accordion.Title
                        active={activeIndex === 1}
                        index={1}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name="dropdown" />
                        <Icon name="user circle" />
                        Top Posters
                    </Accordion.Title>

                    <Accordion.Content active={activeIndex === 1}>
                        <List>
                            {userPosts && this.displayTopPosters(userPosts)}
                        </List>
                    </Accordion.Content>

                    <Accordion.Title
                        active={activeIndex === 2}
                        index={2}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name="dropdown" />
                        <Icon name="pencil alternate" />
                        Created By
                    </Accordion.Title>

                    <Accordion.Content active={activeIndex === 2}>
                        <Header as="h3">
                            <Image circular src={currentChannel.createdBy.avatar} />
                            {currentChannel.createdBy.name}
                        </Header>
                    </Accordion.Content>
                </Accordion>
            </Segment>
        )
    }
}
