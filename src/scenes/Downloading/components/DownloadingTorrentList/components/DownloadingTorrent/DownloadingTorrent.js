import { inject } from 'mobx-react'
import { StateT } from 'joystream-node'
import utils from '../../../../../../utils/'

//  100, 5, 1, 20000
const buyerTerms = {
  maxPrice: 100,
  maxLock: 5,
  minNumberOfSellers: 1,
  maxContractFeePerKb: 20000
}

const DownloadingTorrent = inject('applicationStore')((props) => {
  const torrent = props.torrent
  const applicationStore = props.applicationStore

  function startBuying () {
    let infoHash = torrent.handle.infoHash()

    applicationStore.buyingTorrent(infoHash, buyerTerms)
  }

  return (
    <tr>
      <td>{torrent.name}</td>
      <td>{torrent.sizeMB} Mb</td>
      <td>{torrent.progressPercent}%</td>
      <td>{StateT.properties[torrent.libtorrentState].name}</td>
      {/* If we have a buyer show button startSelling or startSelling directly after finding it */}
      <td>{torrent.mode === utils.TorrentMode.BUY_MODE ? <p>In Buy Mode</p> : <button className="btn btn-default" onClick={startBuying}>Start buying</button>}</td>
    </tr>
  )
})

export default DownloadingTorrent