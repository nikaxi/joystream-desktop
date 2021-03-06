/**
 * Created by bedeho on 16/03/2018.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {
  ButtonSection,
  PrimaryButton,
  Subtitle
} from '../../../../components/Dialog'

import SvgIcon from 'material-ui/SvgIcon'

import {ErrorCodes} from '../../../../core/Application/faucet'

import assert from 'assert'

function errorMessageFromErrorCode(errorCode) {

  let message

  switch(errorCode) {

    case ErrorCodes.NETWORK_ERROR:
      message = 'Network request failed'
      break

    case ErrorCodes.RESPONSE_PARSE_ERROR:
      message = 'Malformed response from faucet'
      break

    case ErrorCodes.RATE_LIMIT_SERVER:
      message = 'Try again later, faucet has hit its payout limit for now'
      break

    case ErrorCodes.RATE_LIMIT_CLIENT:
      message = 'You have exhausted your payout limit for now'
      break

    case ErrorCodes.WALLET_OFFLINE:
      message = 'Faucet module offline'
      break

    case ErrorCodes.NO_FUNDS:
      message = 'Faucet depleted, please inform staff'
      break

    case ErrorCodes.ADDRESS_MISSING:
      message = 'Address missing'
      break

    case ErrorCodes.ADDRESS_INVALID:
      message = 'Bad address sent'
      break

    case ErrorCodes.SERVER_INTERNAL_ERROR:
      message = 'Faucet internal error'
      break

    default:
      assert(false, 'Foreign ErrorCode')
  }

  return message
}

// Styling generator
function getStyles(props) {

  return {
    root : {
      display : 'flex',
      flexDirection : 'column'
    },
    iconContainer : {
      display : 'flex',
      alignItems : 'center',
      justifyContent : 'center',
      height : '150px'
    },
    icon: {
      width : '90px',
      height : '90px'
    },
    message : {
      display : 'flex',
      alignItems : 'center',
      justifyContent : 'center',
      paddingBottom : '30px',
      paddingLeft : '60px',
      paddingRight : '60px',
      fontSize: '24px',
      fontFamily: 'Helvetica',
      textAlign: 'center',
      fontWeight: '100'
    }
  }
}

const FailIcon = (props) => {

  return (
    <SvgIcon viewBox="0 0 64 64" style={props.style}>
      <circle fill="none" stroke={props.strokeColor} strokeWidth="4" strokeLinecap="square" strokeMiterlimit="10" cx="32" cy="32" r="30" strokeLinejoin="miter"></circle>
      <circle fill="none" stroke={props.strokeColor} strokeWidth="4" strokeLinecap="square" strokeMiterlimit="10" cx="32" cy="48" r="3" strokeLinejoin="miter"></circle>
      <line fill="none" stroke={props.strokeColor} strokeWidth="4" strokeLinecap="square" strokeMiterlimit="10" x1="32" y1="12" x2="32" y2="36" strokeLinejoin="miter"></line>
    </SvgIcon>
  )
}

const FailedForm = (props) => {

  let styles = getStyles(props)

  let errorMessage = errorMessageFromErrorCode(props.errorCode)

  return (
    <div style={styles.root}>

      <div style={styles.iconContainer}>
        <FailIcon style={styles.icon}
                  strokeColor="#F44336"
        />
      </div>

      <div style={styles.message}>
        {errorMessage}
      </div>

      <ButtonSection>

        <PrimaryButton label="Ok"
                       onClick={props.onClick}
                       disabled={false}

        />

      </ButtonSection>

    </div>
  )
}

FailedForm.propTypes = {
  errorCode : PropTypes.number,
  onClick : PropTypes.func.isRequired
}

export default FailedForm