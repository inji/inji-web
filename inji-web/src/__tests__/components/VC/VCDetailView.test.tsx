import React from 'react';
import {fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {VCDetailView} from "../../../components/VC/VCDetailView";
import {mockUseTranslation} from "../../../test-utils/mockUtils";
import {mockVerifiableCredentials} from "../../../test-utils/mockObjects";
import {WalletCredential} from "../../../types/data";

mockUseTranslation()
jest.mock('../../../components/Preview/PDFViewer', () => ({
  PDFViewer: ({ previewContent } : {
      previewContent: Blob
  }) => (
    <div data-testid="pdf-viewer">{previewContent && previewContent instanceof Blob ? "Test PDF Content" : ""}</div>
  ),
}));

describe('VCDetailView', () => {
  const mockCredential : WalletCredential = mockVerifiableCredentials[0];

  const mockProps = {
    previewContent: new Blob(['Test PDF Content'], { type: "application/pdf" }),
    onClose: jest.fn(),
    onDownload: jest.fn().mockResolvedValue(undefined),
    credential: mockCredential
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when previewContent is provided', () => {
    render(<VCDetailView {...mockProps} />);

    expect(screen.getByTestId('vc-card-detail-view')).toBeInTheDocument();
    expect(screen.getByTestId('title-credential-type-display-name')).toHaveTextContent('Drivers License');
    const detailViewContent = screen.getByTestId("vc-card-detail-view-content");
    expect(detailViewContent).toBeInTheDocument()
    expect(within(detailViewContent).getByTestId('pdf-viewer')).toHaveTextContent('Test PDF Content');
  });

  it('should not render modal when previewContent is empty', () => {
    render(<VCDetailView {...({
        previewContent: null as any as Blob, // Simulating no content
        onClose: jest.fn(),
        onDownload: jest.fn().mockResolvedValue(undefined),
        credential: mockCredential
    })} />);

    expect(screen.queryByTestId('vc-card-detail-view')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<VCDetailView {...mockProps} />);

    const closeButton = screen.getByTestId('icon-close');
    fireEvent.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onDownload when download button is clicked', async () => {
    render(<VCDetailView {...mockProps} />);

    // 2 buttons with testId 'btn-download' are rendered - 1 for mobile and 1 for desktop which are hidden based on screen size
    const downloadButton = screen.getAllByTestId('btn-download')[0];
    fireEvent.click(downloadButton);

    expect(mockProps.onDownload).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      // Just ensuring the promise resolves
      expect(mockProps.onDownload).toHaveBeenCalled();
    });
  });

  it('should show status, last checked, and check status when the credential supports status', () => {
    const onCheckStatus = jest.fn();
    render(
      <VCDetailView
        {...mockProps}
        onCheckStatus={onCheckStatus}
        credential={{
          ...mockCredential,
          statusChecks: [{purpose: "revocation", valid: false}],
          lastCheckedAt: new Date(2025, 9, 20, 18, 30, 0).toISOString(),
        }}
      />
    );

    expect(screen.getByTestId("credential-preview-status-label")).toHaveTextContent("Revoked");
    expect(screen.getByTestId("credential-preview-status-icon")).toHaveStyle({backgroundColor: "#DC2626"});
    expect(screen.getByTestId("credential-preview-status-icon").querySelector("img")).toHaveAttribute("src", "revoked.svg");
    expect(screen.getByTestId("credential-preview-status-info")).toBeInTheDocument();
    expect(screen.getByTestId("credential-preview-last-checked")).toHaveTextContent("Last Checked:");
    expect(screen.getByTestId("credential-preview-last-checked")).toHaveTextContent("20 October 2025, 06:30PM");
    expect(screen.queryByTestId("btn-download")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("btn-preview-download"));
    expect(mockProps.onDownload).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("btn-preview-check-status"));
    expect(onCheckStatus).toHaveBeenCalledTimes(1);
  });

  it('should show the spinning loader in place of the preview status while checking', () => {
    render(
      <VCDetailView
        {...mockProps}
        onCheckStatus={jest.fn()}
        checkingStatus
        credential={{
          ...mockCredential,
          statusChecks: [{purpose: "revocation", valid: false}],
          lastCheckedAt: new Date(2025, 9, 20, 18, 30, 0).toISOString(),
        }}
      />
    );

    expect(screen.getByTestId("credential-preview-status-loader")).toHaveTextContent("Loading Status");
    expect(screen.queryByTestId("credential-preview-status-label")).not.toBeInTheDocument();
    expect(screen.getByTestId("credential-preview-last-checked")).toBeInTheDocument();
  });

  it('should show valid status in the preview when there is no status list', () => {
    render(
      <VCDetailView
        {...mockProps}
        onCheckStatus={jest.fn()}
        credential={{
          ...mockCredential,
          statusChecks: [],
          lastCheckedAt: "2026-11-25T05:09:11.190114Z",
          isExpired: false,
        }}
      />
    );

    expect(screen.getByTestId("credential-preview-status-label")).toHaveTextContent("Valid");
    expect(screen.queryByTestId("btn-download")).not.toBeInTheDocument();
  });

  it('should pass credential title to modal', () => {
    render(
      <VCDetailView
        {...mockProps}
      />
    );

    expect(screen.getByTestId('title-credential-type-display-name')).toHaveTextContent('Drivers License');
  });
});