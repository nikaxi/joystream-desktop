/**
 * Created by bedeho on 12/08/17.
 */

//const TorrentState = require('joystream-node').TorrentState
const TorrentInfo = require('joystream-node').TorrentInfo
const assert = require('assert')
import {remote} from 'electron'

// Either Common should be exported, or .is* functions should be exported,
// or these values should be here. Calling TorrentCommon is just a temporary fix until this is fixed
// see: https://github.com/JoyStream/joystream-electron/issues/215
const TorrentCommon = require('../../Torrent/Statemachine/Common')

const TorrentStatemachine = require('../../Torrent/Statemachine')

function startDownloadWithTorrentFileFromFilePicker(client)  {

    // Allow user to pick a torrent file
    var filesPicked = remote.dialog.showOpenDialog({
        title : "Pick torrent file",
        filters: [
            {name: 'Torrent file', extensions: ['torrent']},
            {name: 'All Files', extensions: ['*']}
        ],
        properties: ['openFile']}
    )

    // If the user did no pick any files, then we are done
    if(!filesPicked || filesPicked.length == 0)
        return

    // Get torrent file name picked
    var torrentFile = filesPicked[0]

    let settings = prepareTorrentParams(client, torrentFile)

    addTorrent(client, settings)

}

function addTorrent(client, settings) {

    const infoHash = settings.infoHash

    let store = client.factories.torrentStore(infoHash)

    let coreTorrent = client.factories.torrent(store)

    // Assign core torrent as action handler
    store.setTorrent(coreTorrent)

    /// Hook into various torrent events

    // When torrent is loaded
    coreTorrent.once('enter-Active.Uninitialized', function (data) {
        client.processStateMachineInput('torrentLoaded')
    })

    // When torrent cannot be added to libtorrent session
    coreTorrent.on('enter-Loading.FailedAdding', function (data) {
        console.log('Catastrophic failure, failed adding torrent.')
        assert(false)
    })

    // When torrent is missing buyer terms
    coreTorrent.on('enter-Loading.WaitingForMissingBuyerTerms', function (data) {
        client.processStateMachineInput('torrentWaitingForMissingBuyerTerms', coreTorrent)
    })

    // When torrent has completed downloading
    coreTorrent.on('Active.FinishedDownloading.Passive', function (data) {
        client.processStateMachineInput('torrentFinishedDownloading', infoHash)
    })


    // settings.metadata has to be a TorrentInfo object
    assert(settings.metadata instanceof TorrentInfo)

    if (settings.resumeData) {
        var resumeData = Buffer.from(settings.resumeData, 'base64')
    }

    coreTorrent.startLoading(infoHash, settings.name, settings.savePath, resumeData, settings.metadata, settings.deepInitialState, settings.extensionSettings)

    client.torrents.set(infoHash, coreTorrent)

    client.store.torrentAdded(store)

    let params = {
        name: settings.name,
        savePath: settings.savePath,
        ti: settings.metadata
    }

    // joystream-node decoder doesn't correctly check if resumeData propery is undefined, it only checks
    // if the key on the params object exists so we need to conditionally set it here.
    if (resumeData) params.resumeData = resumeData

    // Whether torrent should be added in (libtorrent) paused mode from the get go
    let addAsPaused = TorrentCommon.isStopped(settings.deepInitialState)

    // Automanagement: We never want this, as our state machine should explicitly control
    // pause/resume behaviour torrents for now.
    //
    // Whether libtorrent is responsible for determining whether it should be started or queued.
    // Queuing is a mechanism to automatically pause and resume torrents based on certain criteria.
    // The criteria depends on the overall state the torrent is in (checking, downloading or seeding).
    let autoManaged = false

    // set param flags - auto_managed/paused
    params.flags = {
        paused: addAsPaused,
        auto_managed: autoManaged
    }

    client.services.session.addTorrent(params, function (err, torrent) {
        // Is this needed ?
        //client.processStateMachineInput('torrentAdded', err, torrent, coreTorrent)
        coreTorrent.addTorrentResult(err, torrent)
    })

}

function prepareTorrentParams (client, filePath) {

  // Load torrent file
  let torrentInfo

  try {
    torrentInfo = new TorrentInfo(filePath)
  } catch(e) {

    console.log(e)

    // <Set error_code on store also perhaps?>

    throw 'TorrentFileWasInvalid'
  }

  const infoHash = torrentInfo.infoHash()

  // Make sure torrent is not already added
  if(client.torrents.has(infoHash)) {

    throw 'TorrentAlreadyAdded'
  }

  // NB: Get from settings data store of some sort
  let terms = getStandardBuyerTerms()

  // Create settings
  let settings = {
    infoHash : infoHash,
    metadata : torrentInfo,
    resumeData : null,
    name: torrentInfo.name() || infoHash,
    savePath: client.directories.defaultSavePath(),
    deepInitialState: TorrentStatemachine.DeepInitialState.DOWNLOADING.UNPAID.STARTED,
    extensionSettings : {
      buyerTerms: terms
    }
  }


  return settings
}

function getStandardBuyerTerms() {
    return {
        maxPrice: 1,
        maxLock: 5,
        minNumberOfSellers: 1,
        maxContractFeePerKb: 2000
    }
}

function getStandardSellerTerms() {
    return {
        minPrice: 1,
        minLock: 5,
        maxNumberOfSellers: 1,
        minContractFeePerKb: 2000
    }
}

export {
    getStandardBuyerTerms,
    getStandardSellerTerms,
    startDownloadWithTorrentFileFromFilePicker,
    addTorrent,
    prepareTorrentParams
}
