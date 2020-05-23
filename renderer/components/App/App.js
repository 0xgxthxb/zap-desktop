import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Flex } from 'rebass/styled-components'
import createScheduler from '@zap/utils/scheduler'
import Wallet from 'containers/Wallet'
import Activity from 'containers/Activity'
import LnurlWithdrawalPrompt from 'containers/Pay/LnurlWithdrawalPrompt'

// Bitcoin blocks come on average every 10 mins
// but we poll a lot more frequently to make UI a little bit more responsive
const TX_REFETCH_INTERVAL = 1000 * 60 * 1

// Refresh autopilot scores every hour.
const AUTOPILOT_SCORES_REFRESH_INTERVAL = 1000 * 60 * 60

// Initial re-fetch after 30 seconds.
const PEERS_INITIAL_REFETCH_INTERVAL = 1000 * 30

// Fetch peers list data no less than once every 10 minutes.
const PEERS_MAX_REFETCH_INTERVAL = 1000 * 60 * 10

// Amount to increment re-fetch timer by after each fetch.
const PEERS_REFETCH_BACKOFF_SCHEDULE = 2

// App scheduler / polling service
const appScheduler = createScheduler()

const App = ({
  isAppReady,
  modals,
  redirectPayReq,
  updateAutopilotNodeScores,
  initActivityHistory,
  setIsWalletOpen,
  fetchDescribeNetwork,
  fetchPeers,
  fetchTransactions,
  setModals,
  initBackupService,
  fetchSuggestedNodes,
  initTickers,
  lnurlWithdrawParams,
  finishLnurlWithdrawal,
  willShowLnurlWithdrawalPrompt,
}) => {
  /**
   * App scheduler / polling service setup. Add new app-wide polls here
   */
  useEffect(() => {
    /**
     * Fetch node data on an exponentially incrementing backoff schedule so that when the app is first mounted, we fetch
     * node data quite frequently but as time goes on the frequency is reduced to a max of PEERS_MAX_REFETCH_INTERVAL
     */
    appScheduler.addTask({
      task: () => fetchDescribeNetwork() && fetchPeers(),
      taskId: 'fetchNetworkData',
      baseDelay: PEERS_INITIAL_REFETCH_INTERVAL,
      maxDelay: PEERS_MAX_REFETCH_INTERVAL,
      backoff: PEERS_REFETCH_BACKOFF_SCHEDULE,
    })

    appScheduler.addTask({
      task: () => fetchTransactions(true),
      taskId: 'fetchTransactions',
      baseDelay: TX_REFETCH_INTERVAL,
    })

    appScheduler.addTask({
      task: updateAutopilotNodeScores,
      taskId: 'updateAutopilotNodeScores',
      baseDelay: AUTOPILOT_SCORES_REFRESH_INTERVAL,
    })

    return () => {
      appScheduler.removeAllTasks()
    }
  }, [fetchDescribeNetwork, fetchPeers, fetchTransactions, updateAutopilotNodeScores])

  useEffect(() => {
    // Set wallet open state.
    setIsWalletOpen(true)
    // fetch data from lnd.
    initActivityHistory()
    // fetch node info.
    fetchPeers()
    // fetch network info
    fetchDescribeNetwork()
    // Update autopilot node scores.
    updateAutopilotNodeScores()
    fetchSuggestedNodes()
    initTickers()
    // initialize backup service in forceUseTokens mode to avoid
    // launching it for wallets that don't have backup setup
    initBackupService()
    if (!willShowLnurlWithdrawalPrompt) {
      finishLnurlWithdrawal()
    }
  }, [
    initActivityHistory,
    fetchDescribeNetwork,
    fetchPeers,
    fetchSuggestedNodes,
    initBackupService,
    initTickers,
    setIsWalletOpen,
    updateAutopilotNodeScores,
    finishLnurlWithdrawal,
    lnurlWithdrawParams,
    willShowLnurlWithdrawalPrompt,
  ])

  // Open the pay form when a payment link is used.
  useEffect(() => {
    if (isAppReady && redirectPayReq) {
      if (!modals.find(m => m.type === 'PAY_FORM')) {
        setModals([{ type: 'PAY_FORM' }])
      }
    }
  }, [redirectPayReq, isAppReady, modals, setModals])

  if (!isAppReady) {
    return null
  }

  return (
    <Flex as="article" flexDirection="column" width={1}>
      <Wallet />
      <Activity />
      {willShowLnurlWithdrawalPrompt && <LnurlWithdrawalPrompt />}
    </Flex>
  )
}

App.propTypes = {
  fetchDescribeNetwork: PropTypes.func.isRequired,
  fetchPeers: PropTypes.func.isRequired,
  fetchSuggestedNodes: PropTypes.func.isRequired,
  fetchTransactions: PropTypes.func.isRequired,
  finishLnurlWithdrawal: PropTypes.func.isRequired,
  initActivityHistory: PropTypes.func.isRequired,
  initBackupService: PropTypes.func.isRequired,
  initTickers: PropTypes.func.isRequired,
  isAppReady: PropTypes.bool.isRequired,
  lnurlWithdrawParams: PropTypes.object,
  modals: PropTypes.array.isRequired,
  redirectPayReq: PropTypes.object,
  setIsWalletOpen: PropTypes.func.isRequired,
  setModals: PropTypes.func.isRequired,
  updateAutopilotNodeScores: PropTypes.func.isRequired,
  willShowLnurlWithdrawalPrompt: PropTypes.bool,
}

export default App
