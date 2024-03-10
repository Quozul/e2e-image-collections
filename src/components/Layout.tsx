import { encryption } from "~/helpers/newEncryption";

function download(fileName: string, res: Blob) {
  const element = document.createElement("a");
  element.setAttribute("download", fileName);
  const href = URL.createObjectURL(res);
  element.href = href;
  element.setAttribute("target", "_blank");
  element.click();
  URL.revokeObjectURL(href);
}

export default function Layout() {
  return (
    <div className="flex-col">
      <div className="flex align-center p-2">
        <div className="flex align-center p-2 bg-background-muted rounded-1">
          App title
          <button>
            <i className="bi bi-list" />
          </button>
        </div>

        <div>
          <h1>Page title</h1>
          Page content Encrypt
          <input
            type="file"
            onInput={async ({ currentTarget }) => {
              const encrypted = await encryption(currentTarget.files!.item(0)!);
              // download("file.jpg", decrypted);
            }}
          />
        </div>
      </div>
    </div>
  );
}
