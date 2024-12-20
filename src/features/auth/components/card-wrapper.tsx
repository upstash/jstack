import { Card, CardContent, CardFooter, CardHeader } from "@/src/components/ui/card";
import BackButton from "./back-button";
import Header from "./header";
import Social from "./social";

type Props = {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
};

const CardWrapper = ({
  backButtonHref,
  backButtonLabel,
  children,
  headerLabel,
  showSocial,
}: Props) => {
  return (
    <Card className=" w-full shadow-md">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      <CardFooter>
        <BackButton
            label={backButtonLabel}
            href={backButtonHref}
        />
      </CardFooter>
    </Card>
  );
};

export default CardWrapper;
