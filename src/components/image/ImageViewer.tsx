import { PropsWithChildren, SyntheticEvent, useEffect, useState } from "react";
import { UseFile } from "~/components/image/useImage";
import Password from "~/components/password/Password";
import { classNames } from "~/helpers/classNames";

type Props = {
  file: UseFile;
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

  useEffect(() => {
    setIsLoading(true);
  }, [file.url]);

  if (file.isEncrypted && !file.isDecrypting) {
    return (
      <Status className={className} icon="shield-lock">
        The file is encrypted
        <Password placeholder="Enter password to decrypt" />
      </Status>
    );
  }

  if (!file.isReady || file.file === null || file.url === null) {
    return (
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

  if (file.file.type.startsWith("image/")) {
    return (
      <>
        {isLoading && (
          <Status className={className} icon="hourglass">
            The file is loading
          </Status>
        )}

        <img
          alt={file.file.name}
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

  if (file.file.type.startsWith("video/")) {
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
