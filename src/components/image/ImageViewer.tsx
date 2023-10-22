import { PropsWithChildren, SyntheticEvent, useEffect, useState } from "react";
import { useFile } from "~/components/image/useImage";
import Password from "~/components/password/Password";
import { classNames } from "~/helpers/classNames";

type Props = {
  collectionFiles: string[];
  collectionName: string;
  imageName: string;
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

export default function ImageViewer({ collectionFiles, collectionName, imageName, className, onClick, onLoad }: Props) {
  const file = useFile(collectionFiles, collectionName, imageName!);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
  }, [file.url]);

  if (file.isFetching) {
    return (
      <Status className={className} icon="hourglass">
        The file is downloading
      </Status>
    );
  }

  if (file.isDecrypting) {
    return (
      <Status className={className} icon="key-fill">
        The file is decrypting
      </Status>
    );
  }

  if (file.isEncrypted) {
    return (
      <Status className={className} icon="shield-lock">
        The file is encrypted
        <Password placeholder="Enter password to decrypt" />
      </Status>
    );
  }

  if (!file.isReady) {
    return (
      <Status className={className} icon="bug-fill">
        The file cannot be displayed
      </Status>
    );
  }

  if (file.file === null || file.url === null) {
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

  return (
    <Status className={className} icon="file-earmark">
      Cannot display file preview
    </Status>
  );
}
