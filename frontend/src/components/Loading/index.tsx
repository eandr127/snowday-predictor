import { TFunction } from "i18next"

import { GlobalState } from "../../types/types"

import React from "react"
import { connect } from "react-redux"
import Loader from "./Loader"

type ConnectedLoading = {
  t: TFunction
  loading: boolean
}

const mapStateToProps = (props: GlobalState) => ({
  t: props.i18nReducer.t,
  loading: props.UserInputReducer.loading,
})

export default connect(mapStateToProps)(({ t, loading }: ConnectedLoading) =>
  loading ? <Loader /> : <></>
)
