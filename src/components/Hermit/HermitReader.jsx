import React, {Component} from "react";
import PropTypes from "prop-types";
import {
  PENDING,
  ACTIVE,
} from "unchained-wallets";

// Components
import QrReader from "react-qr-reader";
import { Grid, Button, Box, FormHelperText} from '@material-ui/core';
import Copyable from "../Copyable";

const QR_CODE_READER_DELAY = 300; // ms?

class HermitReader extends Component {

  static propTypes = {
    onStart: PropTypes.func,
    onSuccess: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    width: PropTypes.string.isRequired,
    startText: PropTypes.string.isRequired,
    interaction: PropTypes.object.isRequired,
  };

  static defaultProps = {
    width: "256px",
    startText: "Scan",
  }
  
  state = {
    walletState: PENDING,
    error: '',
  };

  render = () => {
    const {walletState, error} = this.state;
    const {interaction, width, startText} = this.props;

    if (walletState === PENDING) {
      const commandMessage = interaction.messageFor({walletState, code: "hermit.command"});
      return (
        <div>
          <p>{commandMessage.instructions}</p>
          <Grid container justify="center" className="mb-2">
            <Copyable text={commandMessage.command}>
              <code><strong>{commandMessage.mode}&gt;</strong> {commandMessage.command}</code>
            </Copyable>
          </Grid>
          <p>When you are ready, scan the QR code produced by Hermit:</p>
          <Box mt={2}>
            <Button  variant="contained" color="primary" className="mt-2" size="large" onClick={this.handleStart}>{startText}</Button>
          </Box>
        </div>
      );
    } 

    if (walletState === ACTIVE) {
      return (
        <Grid container direction="column">
          <Grid item>
            <QrReader 
              delay={QR_CODE_READER_DELAY} 
              onError={this.handleError} 
              onScan={this.handleScan}
              style={{width}}
              facingMode='user'
            />
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" size="small" onClick={this.handleStop}>Cancel</Button>
          </Grid>
        </Grid>
      );
    }
    
    if (walletState === 'error' || walletState === 'success') {
      return (
        <div>
          <FormHelperText error>{error}</FormHelperText>
          <Button variant="contained" color="secondary" size="small" onClick={this.handleStop}>Reset</Button>
        </div>
      );
    }

    return null;
  }

  handleStart = () => {
    const {onStart} = this.props;
    this.setState({walletState: ACTIVE, error: ''});
    if (onStart) { onStart(); }
  }

  handleError = (error) => {
    const {onClear} = this.props;
    this.setState({walletState: 'error', error: error.message});
    if (onClear) {onClear(); }
  }

  handleScan = (data) => {
    const {onSuccess, interaction} = this.props;
    if (data) {
      try {
        const result = interaction.parse(data);
        onSuccess(result);
        this.setState({walletState: 'success'});
      } catch(e) {
        this.handleError(e);
      }
    }
  }

  handleStop = () => {
    const {onClear} = this.props;
    this.setState({
      walletState: PENDING,
      error: '',
    });
    if (onClear) {onClear(); }
  }

}

export default HermitReader;

