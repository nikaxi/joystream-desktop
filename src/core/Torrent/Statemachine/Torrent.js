/**
 * Created by bedeho on 13/06/17.
 */
var BaseMachine = require('../../BaseMachine')
var Loading = require('./Loading/Loading')
var Active = require('./Active')
var Common = require('./Common')
var DeepInitialState = require('./DeepInitialState').default

const assert = require('assert')

var Torrent = new BaseMachine({

    initialState: "Loading",

    states: {

        Loading : {

            _child : Loading,

            terminate : function(client) {

                // - We ignore resume data generation, given
                // that we ar still loading.
                // - We also do not need to stop the extension, as
                // it has not yet been started

                this.transition(client, 'Terminated')
            }
        },

        Active : {

            _child : Active,

            terminate: function(client, generateResumeData) {

              client._generateResumeDataOnTermination = generateResumeData

              Common.stopExtension(client)

              this.transition(client, 'StoppingExtension')
            },

            processPeerPluginStatuses: function (client, statuses) {
              Common.processPeerPluginStatuses(client, statuses)
            },

            uploadStarted: function (client, alert) {
              var peer = client.peers[alert.pid]
              peer.uploadStarted(alert)
            },

            anchorAnnounced: function (client, alert) {
              var peer = client.peers[alert.pid]
              peer.anchorAnnounced(alert)
            },

            lastPaymentReceived: function (client, alert) {

                if (!alert.settlementTx) {
                  // A settlement transaction is only created if it is worthwile
                  console.log('Last Payment Received: No Settlement will be made')
                  return
                }

                client._broadcastRawTransaction(alert.settlementTx)
            }
        },

        // We want the application to handle events that result from stopping extension
        // such as claiming last payment so we wait for extension to stop
        StoppingExtension: {

            stopExtensionResult: function (client) {

              // Stop libtorrent torrent
              client._joystreamNodeTorrent.handle.pause()

                if (client._generateResumeDataOnTermination && client.hasOutstandingResumeData()) {

                    client._joystreamNodeTorrent.handle.saveResume_data()

                    this.transition(client, 'GeneratingResumeData')

                } else {

                    this.transition(client, 'Terminated')
                }
            },

            lastPaymentReceived: function (client, alert) {

              if (!alert.settlementTx) {
                // A settlement transaction is only created if it is worthwile
                console.log('Last Payment Received: No Settlement will be made')
                return
              }

              client._lastPaymentReceived(alert)
            }
        },

        GeneratingResumeData : {
            resumeDataGenerated : function (client, resumeData) {

                client._setResumeData(resumeData)

                this.transition(client, 'Terminated')
            },

            resumeDataGenerationFailed: function (client, error_code) {

              client._setResumeData(null)

                this.transition(client, 'Terminated')
            }
        },

        Terminated : {
            // Event drain, to prevent any further processing of events
            '*' : function (client) {
                console.log("Ignored event on state: Torrent.Terminated")
            }

        }

    }
})


module.exports = Torrent
