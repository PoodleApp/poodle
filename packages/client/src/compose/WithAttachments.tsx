import { makeStyles, IconButton } from "@material-ui/core"
import AttachFileIcon from "@material-ui/icons/AttachFile"
import PhotoIcon from "@material-ui/icons/Photo"
import * as React from "react"
import Tooltip from "../Tooltip"

const Context = React.createContext<ReturnType<typeof useAttachments>>({
  attachments: [],
  handleAttachments() {}
})

const useStyles = makeStyles(_theme => ({
  attachment: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start"
  },
  input: {
    display: "none"
  }
}))

function useAttachments(): {
  attachments: File[]
  handleAttachments: React.FormEventHandler
} {
  const [attachments, setAttachments] = React.useState<File[]>([])

  return React.useMemo(() => {
    function handleAttachments(event: React.FormEvent<HTMLInputElement>) {
      const files = Array.from(event.currentTarget.files || [])
      const updatedFiles = [...attachments, ...files]
      setAttachments(updatedFiles)
    }

    return { attachments, handleAttachments }
  }, [attachments, setAttachments])
}

function WithAttachments({ children }: { children: React.ReactNode[] }) {
  return (
    <Context.Provider value={useAttachments()}>{children}</Context.Provider>
  )
}

function Attachments() {
  const classes = useStyles()
  const context = React.useContext(Context)
  const elements = context.attachments.map((attachment, i) => {
    return (
      <div className={classes.attachment} key={`${attachment.name}-${i}`}>
        <PhotoIcon />
        {attachment.name}
      </div>
    )
  })
  return <>{elements}</>
}

function AddAttachmentButton() {
  const classes = useStyles()
  const context = React.useContext(Context)
  return (
    <>
      <input
        className={classes.input}
        id="add-attachment-button"
        multiple
        type="file"
        onChange={context.handleAttachments}
      />
      <label htmlFor="add-attachment-button">
        <Tooltip title={"Add Attachment"}>
          <IconButton component="span">
            <AttachFileIcon />
          </IconButton>
        </Tooltip>
      </label>
    </>
  )
}

WithAttachments.Attachments = Attachments
WithAttachments.AddAttachmentButton = AddAttachmentButton

export default WithAttachments
