import { PropsWithChildren, SyntheticEvent, useContext, useEffect, useState } from "react";
import { classNames } from "~/helpers/classNames";
import { Image } from "~/workers/UploadWorker";
import Password from "~/components/password/Password";
import { CryptoContext } from "~/contexts/CryptoContext";

type Props = {
  file: Image | null;
  className: string;
  onClick?: () => void;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
};

function Status({ className, icon, children }: PropsWithChildren<{ className: string; icon: string }>) {
  return (
    <div className={className}>
      <h1>
        <i className={`bi bi-${icon}`} />
      </h1>
      {children}
    </div>
  );
}

export default function ImageViewer({ file, className, onClick, onLoad }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { key } = useContext(CryptoContext);

  useEffect(() => {
    setIsLoading(true);
  }, [file?.url]);

  if (file === null) {
    return key === null ? (
      <Status className={className} icon="shield-lock">
        The file is encrypted
        <Password placeholder="Enter password to decrypt" />
      </Status>
    ) : (
      <Status className={className} icon="hourglass">
        The file is loading
      </Status>
    );
  }

  const imageClasses = classNames({
    [className]: true,
    "cursor-pointer": true,
    none: isLoading,
  });

  if (file.fileType.startsWith("image/")) {
    return (
      <>
        {isLoading && (
          <Status className={className} icon="hourglass">
            The file is loading
          </Status>
        )}

        <img
          alt={file.fileName}
          onClick={onClick}
          className={imageClasses}
          src={file.url}
          onLoad={(event) => {
            setIsLoading(false);
            onLoad?.(event);
          }}
        />
      </>
    );
  }

  if (file.fileType.startsWith("video/")) {
    return (
      <>
        {isLoading && (
          <Status className={className} icon="hourglass">
            The file is loading
          </Status>
        )}

        <video
          className={imageClasses}
          src={file.url}
          controls
          onLoadedData={() => {
            setIsLoading(false);
          }}
        />
      </>
    );
  }

  return (
    <Status className={className} icon="file-earmark">
      Cannot display file preview
    </Status>
  );
}
