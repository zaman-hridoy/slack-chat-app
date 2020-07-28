import React from 'react';
import './App.css';
import { Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';

import ColorPanel from './ColorPanel/ColorPanel.js';
import SidePanel from './SidePanel/SidePanel.js';
import Messages from './Messages/Messages.js';
import MetaPanel from './MetaPanel/MetaPanel.js';

function App(props) {
  return (
    <Grid columns="equal" className="app" style={{ background: props.secondaryColor }}>
        <ColorPanel
            key={props.currentUser.name}
            currentUser={props.currentUser}
        />
        <SidePanel 
            key={props.currentUser && props.currentUser.uid}
            currentUser={props.currentUser} 
            primaryColor={props.primaryColor}
        />
        <Grid.Column style={{marginLeft: 320}}>
           <Messages 
              key={props.currentChannel && props.currentChannel.id}
              currentChannel={props.currentChannel}
              currentUser={props.currentUser} 
              isPrivate={props.isPrivate}
           />
        </Grid.Column>

        <Grid.Column width={4}>
            <MetaPanel 
              key={props.currentChannel && props.currentChannel.name}
              isPrivate={props.isPrivate}
              currentChannel={props.currentChannel}
              userPosts={props.userPosts}
            />
        </Grid.Column>
    </Grid>
  );
}

const mapStateToProps = ({ user, channel, colors }) => {
  return {
    currentUser: user.currentUser,
    currentChannel: channel.currentChannel,
    isPrivate: channel.isPrivate,
    userPosts: channel.userPosts,
    primaryColor: colors.primaryColor,
    secondaryColor: colors.secondaryColor
  }
}

export default connect(mapStateToProps)(App);
