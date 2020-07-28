import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route, withRouter} from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import App from './components/App.js';
import Login from './components/Auth/Login.js';
import Register from './components/Auth/Register.js';
import * as serviceWorker from './serviceWorker';
import firebase from './firebase';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers/index.js';
import Spinner from './Spinner.js';

//actions
import { setUser, clearUser } from './actions/index.js';


const store = createStore(rootReducer, composeWithDevTools());

class Root extends Component {
  componentDidMount() {
    firebase.auth()
            .onAuthStateChanged(user => {
              if(user) {
                console.log(user);
                this.props.setUser(user);
                this.props.history.push('/');
              }else {
                this.props.history.push('/login');
                this.props.clearUser();
              }
            });
  }

  render() {
    return this.props.isLoading ? <Spinner /> : (
      <Switch>
          <Route exact path="/" component={App} />
          <Route  path="/login" component={Login} />
          <Route  path="/register" component={Register} />
      </Switch>
    )
  }
}
const mapStateToProps = state => ({
  isLoading: state.user.isLoading
});


const RootWithAuth = withRouter(connect(mapStateToProps, { setUser, clearUser })(Root));

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();