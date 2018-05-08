import * as React from "react";

import { Container, Divider, Grid, Header, Image, /*List,*/ Segment } from "semantic-ui-react";

import { IMathHubContext, WithContext} from "../../context";

export const Footer = WithContext((context: IMathHubContext) => class extends React.Component {
  public render() {
      return (
        <Segment vertical style={{ margin: "5em 0em 0em", padding: "5em 0em"}}>
          <Container textAlign="left">
            <Divider inverted section />
            <Grid divided inverted stackable>
              <Grid.Row>
                <Grid.Column width={4}>
                  <Header as="h4" content="Developed by:" />
                  <Image
                                size="tiny"
                                src={require("../../../assets/logos/kwarc_logo.png")}
                                style={{ marginRight: "1.5em" }}
                                alt="MathHub Logo"
                                href={"https://kwarc.info/"}
                  />
                  </Grid.Column>
                <Grid.Column width={5}>
                  <Header as="h4" content="Institutions:" />
                  <Image
                                size="tiny"
                                src={require("../../../assets/logos/fau_logo.png")}
                                style={{ marginRight: "1.5em" }}
                                alt="FAU Logo"
                                inline={true}
                                href={"https://www.fau.eu/"}
                  />
                  <Image
                                size="tiny"
                                src={require("../../../assets/logos/odk_logo.png")}
                                style={{ marginRight: "1.5em" }}
                                alt="ODK Logo"
                                inline={true}
                                href={"http://opendreamkit.org/"}
                  />
                  <Image
                                size="tiny"
                                src={require("../../../assets/logos/jacobs_logo.png")}
                                style={{ marginRight: "1.5em" }}
                                alt="Jacobs University Logo"
                                inline={true}
                                href={"https://www.jacobs-university.de/"}
                  />
                  </Grid.Column>
                <Grid.Column width={5}>
                  <Header as="h4" content="Funding" />
                  <Image
                                size="tiny"
                                src={require("../../../assets/logos/eu_logo.png")}
                                style={{ marginRight: "1.5em" }}
                                alt="EU Logo"
                                inline={true}
                  />
                  <Image
                                size="tiny"
                                src={require("../../../assets/logos/leibniz_logo.png")}
                                style={{ marginRight: "1.5em" }}
                                alt="leibniz Logo"
                                inline={true}
                  />
                  <Image
                                size="tiny"
                                src={require("../../../assets/logos/dfg_logo.png")}
                                style={{ marginRight: "1.5em" }}
                                alt="dfg University Logo"
                                inline={true}
                  />
                  </Grid.Column>
              </Grid.Row>
            </Grid>

            <Divider inverted section />
            <div>
              Connected to MMT at {context.config.mmtURL}
            </div>
          </Container>
        </Segment>
      );
    }
});
