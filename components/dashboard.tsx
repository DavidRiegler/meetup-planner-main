"use client"

import { useState } from "react"
import { useIntl } from "./intl-provider"
import { CreateJoinTab } from "./create-join-tab"
import { MyMeetupsTab } from "./my-meetups-tab"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"create-join" | "my-meetups">("create-join")
  const { t } = useIntl()

  return (
    <div className="container">
      <div className="tabs">
        <div className="tabs-list">
          <button
            onClick={() => setActiveTab("create-join")}
            className={`tabs-trigger ${activeTab === "create-join" ? "active" : ""}`}
          >
            {t("createJoin")}
          </button>
          <button
            onClick={() => setActiveTab("my-meetups")}
            className={`tabs-trigger ${activeTab === "my-meetups" ? "active" : ""}`}
          >
            {t("myMeetups")}
          </button>
        </div>
      </div>

      {activeTab === "create-join" && <CreateJoinTab />}
      {activeTab === "my-meetups" && <MyMeetupsTab />}
    </div>
  )
}
