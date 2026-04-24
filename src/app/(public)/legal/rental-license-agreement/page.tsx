export default function RentalLicenseAgreementPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Rental License Procurement Agreement</h1>
        <p className="text-sm text-muted-foreground">v1/2026</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6">
        <div className="border-b pb-4 space-y-1 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Broker (Company):</strong> HubKey Real Estate</p>
              <p><strong>Company License #:</strong> #RB069661</p>
              <p><strong>Company Phone:</strong> 215.600.1799</p>
            </div>
            <div>
              <p><strong>Licensee(s) Name:</strong> Mike Goldstein</p>
              <p><strong>State License #:</strong> RM425953</p>
              <p><strong>Email:</strong> Broker@HubKey.co</p>
            </div>
          </div>
        </div>

        <p className="text-sm font-semibold">
          Owner understands that this Rental License Procurement Agreement is between Broker
          (hereinafter referred to as &ldquo;HubKey&rdquo;) and Owner. This Agreement DOES NOT grant HubKey
          any authority to act as the Property Manager or Leasing Agent for Owner&apos;s Property.
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">1. Appointment</h2>
          <p className="text-sm">
            By agreeing to this Agreement, Owner hereby authorizes HubKey Real Estate
            (&ldquo;HubKey&rdquo;) to act as Owner&apos;s authorized agent in all communications and dealings with
            any municipal or governmental agency required to obtain, renew, or maintain rental
            licenses, certificates of occupancy, or any other permits necessary to make the Property
            legally rentable for Owner&apos;s Property (or Properties).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">2. Property Information</h2>
          <p className="text-sm">
            If the Property is a multi-family property consisting of more than one residential
            dwelling unit, this Rental License Procurement Agreement applies to all residential
            dwelling units at the Property.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">
            3. Rental License Procurement Fee and Other Costs Incurred by Owner
          </h2>
          <p className="text-sm">
            HubKey charges a non-refundable &ldquo;Rental License Procurement Fee&rdquo; for each Property
            stated in this Agreement. The Rental License Procurement Fee must be paid in full by
            Owner prior to HubKey beginning its Rental License Procurement Process.
          </p>
          <p className="text-sm">Additionally, Owner is also responsible for paying for the following items:</p>
          <ul className="text-sm space-y-2 list-disc pl-6">
            <li>
              <strong>Lead-Based Paint Inspection(s)</strong> — The costs of Lead-Based Paint
              Inspections will generally depend on the bedroom count of the Property being
              inspected.
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>
                  Owner is solely responsible for the costs of any Lead-Based Paint Remediation
                  that is required in order for a Lead Certificate to be issued.
                </li>
                <li>
                  Owner is solely responsible for the costs of any reinspections charged by the
                  Lead-Based Paint Inspection Company.
                </li>
              </ul>
            </li>
            <li>
              <strong>Rental License Application Fee</strong> — The City of Philadelphia charges a
              fee per Residential Dwelling Unit (price is subject to change without warning, and
              price may be increased if circumstances require that the Effective Date of the Rental
              License be back-dated).
            </li>
            <li>
              <strong>Back-Payments or Penalties</strong> that must be paid as a condition of the
              City issuing a Rental License.
            </li>
          </ul>

          <div className="bg-muted/50 border rounded-lg p-4 text-sm font-semibold uppercase leading-relaxed">
            Payment of the Rental License Procurement Fee to HubKey does not guarantee the
            delivery of a Rental License. HubKey will make all commercially viable efforts to
            deliver a Rental License to Owner, however, if Owner fails to complete any of the
            necessary actions, or if the application process is delayed or halted for any reason
            outside of HubKey&apos;s reasonable control, then the Owner understands and acknowledges
            that HubKey will not be able to complete its Rental License Procurement Process.
            Owner understands that all payments made to HubKey as stated in this Agreement are
            non-refundable.
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">4. HubKey&apos;s Rental License Procurement Process</h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold">
                Step 1: Owner must complete these three steps before HubKey will begin its process
                of procuring the Rental License.
              </p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Agree to this Agreement.</li>
                <li>Pay Rental License Procurement Fee.</li>
                <li>Complete the Philadelphia Rental License Form.</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">Step 2: Owner will deliver a Philadelphia Tax ID Number.</p>
            </div>

            <div>
              <p className="font-semibold">
                Step 3: HubKey will deliver a Commercial Activity License, if Owner does not
                already have one.
              </p>
            </div>

            <div>
              <p className="font-semibold">
                Step 4: If required, HubKey will order a Lead-Based Paint Inspection from a
                licensed and insured Lead-Based Paint Inspection Company.
              </p>
              <ul className="list-disc pl-6 mt-1 space-y-2">
                <li>
                  If the Property is currently occupied, Owner will be solely responsible for
                  contacting the occupant to alert them that the Lead-Based Paint Inspection will
                  be conducted. Owner must meet the Lead-Based Paint Inspector at the Property to
                  provide access. If the Lead-Based Paint Inspection cannot be completed, either
                  because the Landlord fails to provide access into the Property, or because the
                  Occupant fails to cooperate with the Inspector, then the Owner shall be solely
                  responsible for any re-inspection fees charged by the Lead-Based Paint
                  Inspection Company.
                </li>
                <li>
                  If the initial Lead-Based Paint Inspection determines that the Property requires
                  a Lead-Based Paint Remediation, then the Owner can (a) hire contractors to
                  remediate the Property, or (b) hire HubKey to handle the remediation at an
                  agreed-upon cost. Another Lead-Based Paint Inspection will need to be conducted
                  after the remediation is completed; Owner will be responsible for any
                  reinspection costs charged by the Lead-Based Paint Inspection Company.
                </li>
                <li>
                  When the Property has passed the Lead-Based Paint Inspection, the Lead-Based
                  Paint Inspection Company will issue either (a) a &ldquo;Lead-Free Certificate&rdquo;, or (b) a
                  &ldquo;Lead-Safe Certificate&rdquo;. If the Property is Tenant-occupied, the Owner must send
                  the Certificate to the Tenant for Signature. HubKey will submit the
                  tenant-signed Lead Certificate to the City of Philadelphia Lead Certificate
                  Submission System.
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">
                Step 5: HubKey will complete the Rental License Application through Eclipse on
                behalf of the Property Owner.
              </p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>
                  If the Rental License Application is rejected due to an issue with the
                  Property&apos;s Zoning, then HubKey can recommend an attorney, and the Owner will be
                  responsible for correcting the issue. HubKey will not be able to proceed with
                  the Rental License Procurement Process until any Zoning issues have been
                  resolved. If Owner decides to pause efforts to procure the Rental License
                  Application, Owner understands and acknowledges that HubKey WILL NOT refund the
                  Rental License Procurement Fee, but HubKey WILL refund any payments made by
                  Owner that have not been spent during the course of HubKey&apos;s Rental License
                  Procurement Process.
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold">
                Step 6: HubKey will deliver documents to the Owner as they become available. In
                general, the following documents will be delivered to the Owner during the Rental
                License Procurement Process:
              </p>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Commercial Activity License</li>
                <li>&ldquo;Lead Free Certificate&rdquo; or &ldquo;Lead Safe Certificate&rdquo;</li>
                <li>Rental License</li>
                <li>Certificate of Rental Suitability</li>
                <li>
                  Enrolled in PGW Landlord Cooperation Program (username and password), if
                  applicable
                </li>
              </ul>
            </div>

            <p>
              <strong>Future Renewals of Rental License:</strong> Once HubKey has delivered the
              initial Rental License, Owner is solely responsible for keeping track of the
              Expiration Date, to avoid lapses in the Rental Licensure of the Property.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">5. Timeline for Delivery</h2>
          <p className="text-sm">
            Owner understands and acknowledges that HubKey has not made any guarantee of a
            timeline for procuring the Rental License. HubKey will work as diligently as possible
            to deliver the Rental License. Factors outside of HubKey&apos;s control will determine the
            length of this process.
          </p>
        </section>

        <div className="border-t pt-6 text-sm text-center font-semibold">
          <p>
            NOTICE TO PARTIES: BY COMPLETING PAYMENT, THIS AGREEMENT BECOMES A BINDING
            CONTRACT. Parties to this transaction are advised to consult a Pennsylvania real
            estate attorney before proceeding if they desire legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}
