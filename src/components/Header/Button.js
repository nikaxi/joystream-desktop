/**
 * Created by bedeho on 20/08/17.
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import SvgIcon from 'material-ui/SvgIcon'
import Badge from 'material-ui/Badge'
import {blue500, red500, greenA200} from 'material-ui/styles/colors'

import AbsolutePositionChildren from '../../common/AbsolutePositionChildren'

function getStyles(props, state) {

    let rootColor
    let contentColor

    if(props.selected) {
        rootColor = props.rootColors.selected
        contentColor = props.contentColors.selected
    } else {

        // not selected

        if(state.hover) { //
            rootColor = props.rootColors.hover
            contentColor = props.contentColors.hover
        } else { // normal
            rootColor = props.rootColors.normal
            contentColor = props.contentColors.normal
        }
    }

    return {

        root : Object.assign({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width : '120px',
            height: '80px',
            backgroundColor: rootColor,
        }, props.style),

        contentContainer : {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        },

        notification : {
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            alignItems: 'center',
            position: 'relative',
            top: '0px',
            right: '0px',
            fontWeight: '500',
            fontSize: '12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            color: 'white',
            background: props.notificationColor,
            border: '2px solid ' + rootColor,
        },

        icon : {
            height: '24px',
            width: '24px',
            svgIconColor : contentColor
        },

        title : {
            display : props.title ? 'block' : 'none',
            color: contentColor,
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '0px',
            paddingLeft: '8px',
            paddingRight: '8px',
            borderRadius: '100px',
            backgroundColor : 'none',
            cursor: 'default',
            marginTop: '5px'
        }
    }
}

class Button extends Component {

    constructor(props) {
        super(props)

        this.state = {hover : false}
    }

    handleMouseEnter = () => {
        this.setState({hover : true})
    }

    handleMouseLeave = () => {
        this.setState({hover : false})
    }

    render() {

        var style = getStyles(this.props, this.state)

        return (
            <div style={style.root}
                 onMouseEnter={this.handleMouseEnter}
                 onMouseLeave={this.handleMouseLeave}
                 onClick={this.props.onClick}>

                <div style={style.contentContainer}>

                    <NotificationCount count={this.props.notificationCount} style={style.notification}/>

                    <SvgIcon color={style.icon.svgIconColor}
                             viewBox={this.props.viewBox}
                             style={style.icon}>
                        {this.props.children}
                    </SvgIcon>

                    <span style={style.title}>{this.props.title}</span>

                </div>

            </div>
        )

    }

}

const NotificationCount = (props) => {

    if(!props.count || props.count == 0)
        return null
    else
        return (
            <AbsolutePositionChildren left={5} top={-10}>
                <div style={props.style}>
                    {props.count}
                </div>
            </AbsolutePositionChildren>
        )
}

Button.propTypes = {
    disabled : PropTypes.bool,
    selected : PropTypes.bool,
    title : PropTypes.string.isRequired,
    onClick : PropTypes.func.isRequired,

    rootColors : PropTypes.object.isRequired,
    contentColors : PropTypes.object.isRequired,
    notificationColor : PropTypes.string.isRequired,

    viewBox : PropTypes.string,

    notificationCount : PropTypes.number
}

Button.defaultProps = {
    disabled : false,
    selected : false,
    onClick : () => {},
}


export default Button